import { useCallback, useEffect, useState } from "react";

import { AppShell, type PageId } from "./components/AppShell";

import { GameForm } from "./features/games/GameForm";
import { PinGate } from "./features/games/PinGate";

import { Dashboard } from "./features/rankings/Dashboard";
import { HeadToHeadPage } from "./features/rankings/HeadToHeadPage";
import { RankingsPage } from "./features/rankings/RankingsPage";

import { HistoryPage } from "./features/history/HistoryPage";
import { PlayersPage } from "./features/players/PlayersPage";

import {
  createRepository,
  type DominoRepository,
} from "./lib/repository";

import type {
  Game,
  PeriodFilter,
  Player,
} from "./lib/types";

interface AppProps {
  repository?: DominoRepository;
}

const pageIds: PageId[] = [
  "home",
  "rankings",
  "rivalries",
  "players",
  "history",
  "new-game",
];

const pageFromHash = (): PageId => {
  const candidate = window.location.hash.replace(/^#\/?/, "");

  return pageIds.includes(candidate as PageId)
    ? (candidate as PageId)
    : "home";
};

export function App({
  repository: suppliedRepository,
}: AppProps) {
  const [repository, setRepository] =
    useState<DominoRepository | null>(
      suppliedRepository ?? null,
    );

  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const [page, setPage] =
    useState<PageId>(pageFromHash);

  const [period, setPeriod] =
    useState<PeriodFilter>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [unlocked, setUnlocked] = useState(
    () =>
      sessionStorage.getItem(
        "domino-zaaaap:unlocked",
      ) === "yes",
  );

  const loadData = useCallback(
    async (
      activeRepository: DominoRepository,
    ) => {
      setLoading(true);
      setError("");

      try {
        const [nextPlayers, nextGames] =
          await Promise.all([
            activeRepository.listPlayers(),
            activeRepository.listGames(),
          ]);

        setPlayers(nextPlayers);
        setGames(nextGames);
      } catch {
        setError(
          "Não conseguimos carregar a mesa. Tente novamente.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const activeRepository =
        suppliedRepository ??
        (await createRepository());

      if (cancelled) {
        return;
      }

      setRepository(activeRepository);

      await loadData(activeRepository);
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [loadData, suppliedRepository]);

  useEffect(() => {
    const syncPage = () => {
      setPage(pageFromHash());
    };

    window.addEventListener(
      "hashchange",
      syncPage,
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        syncPage,
      );
    };
  }, []);

  const navigate = (nextPage: PageId) => {
    setPage(nextPage);

    window.location.hash =
      nextPage === "home"
        ? ""
        : nextPage;

    window.scrollTo?.({
      top: 0,
      behavior: "smooth",
    });
  };

  const unlock = () => {
    sessionStorage.setItem(
      "domino-zaaaap:unlocked",
      "yes",
    );

    setUnlocked(true);
  };

  const addGame = async (
    draft: import("./lib/validation").GameDraft,
  ) => {
    if (!repository) {
      throw new Error(
        "Repositório indisponível",
      );
    }

    const now = new Date().toISOString();

    await repository.addGame({
      ...draft,
      id: crypto.randomUUID(),
      createdAt: now,
    });

    await loadData(repository);

    navigate("home");
  };

  const addPlayer = async (
    name: string,
    photoUrl: string,
  ) => {
    if (!repository) {
      throw new Error(
        "Repositório indisponível",
      );
    }

    const avatarSeed = encodeURIComponent(
      name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
    );

    await repository.addPlayer({
      id: crypto.randomUUID(),

      name,

      photoUrl:
        photoUrl ||
        `https://api.dicebear.com/10.x/thumbs/svg?seed=${avatarSeed}`,

      active: true,

      createdAt: new Date().toISOString(),
    });

    await loadData(repository);
  };

const updatePlayer = async (
  player: Player,
  changes: Partial<Pick<Player, "active">>,
) => {
  if (!repository) {
    throw new Error("Repositório indisponível");
  }

  await repository.updatePlayer(
    player.id,
    changes,
  );

  await loadData(repository);
};

  return (
    <AppShell
      activePage={page}
      onNavigate={navigate}
    >
      {loading && (
        <div
          className="page-wrap loading-grid"
          aria-label="Carregando ranking"
        >
          <span />
          <span />
          <span />
        </div>
      )}

      {error && (
        <section
          className="page-wrap error-panel"
          role="alert"
        >
          <strong>
            Ops, a rodada travou.
          </strong>

          <p>{error}</p>

          {repository && (
            <button
              className="button button-secondary"
              type="button"
              onClick={() =>
                void loadData(repository)
              }
            >
              Tentar novamente
            </button>
          )}
        </section>
      )}

      {!loading &&
        !error &&
        page === "home" && (
          <Dashboard
            players={players}
            games={games}
            period={period}
            onPeriodChange={setPeriod}
            onShowRankings={() =>
              navigate("rankings")
            }
            onNewGame={() =>
              navigate("new-game")
            }
          />
        )}

      {!loading &&
        !error &&
        page === "new-game" &&
        !unlocked && (
          <PinGate
            expectedPin={
              import.meta.env
                .VITE_SHARED_PIN ||
              "1234"
            }
            onUnlock={unlock}
          />
        )}

      {!loading &&
        !error &&
        page === "new-game" &&
        unlocked && (
          <GameForm
            players={players}
            onSave={addGame}
            onCancel={() =>
              navigate("home")
            }
          />
        )}

      {!loading &&
        !error &&
        page === "rankings" && (
          <RankingsPage
            players={players}
            games={games}
          />
        )}

      {!loading &&
        !error &&
        page === "rivalries" && (
          <HeadToHeadPage
            players={players}
            games={games}
          />
        )}

      {!loading &&
        !error &&
        page === "players" && (
<PlayersPage
  players={players}
  editable={unlocked}
  onAddPlayer={addPlayer}
  onUpdatePlayer={updatePlayer}
/>
        )}

      {!loading &&
        !error &&
        page === "history" && (
          <HistoryPage
            players={players}
            games={games}
          />
        )}
    </AppShell>
  );
}