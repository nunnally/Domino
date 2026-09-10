import { useState, type FormEvent } from "react";
import {
  Check,
  Pencil,
  Plus,
  UserRoundCheck,
  UserRoundX,
  X,
} from "lucide-react";

import { DominoTile } from "../../components/DominoTile";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { isGuestPlayer, type Player } from "../../lib/types";

interface PlayersPageProps {
  players: Player[];
  editable: boolean;

  onAddPlayer: (
    name: string,
    photoUrl: string,
    catchphrase: string,
  ) => Promise<void>;

  onUpdatePlayer: (
    player: Player,
    changes: Partial<
      Pick<Player, "name" | "photoUrl" | "catchphrase" | "active">
    >,
  ) => Promise<void>;
  onOpenProfile?: (playerId: string) => void;
  onCompare?: () => void;
}

export function PlayersPage({
  players,
  editable,
  onAddPlayer,
  onUpdatePlayer,
  onOpenProfile,
  onCompare,
}: PlayersPageProps) {
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [catchphrase, setCatchphrase] = useState("");

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  const [nameDraft, setNameDraft] = useState("");
  const [photoDraft, setPhotoDraft] = useState("");

  const [editingPhraseId, setEditingPhraseId] = useState<string | null>(null);

  const [phraseDraft, setPhraseDraft] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const togglePlayer = async (player: Player) => {
    setError("");

    try {
      await onUpdatePlayer(player, {
        active: !player.active,
      });
    } catch (error) {
      console.error("Erro ao alterar jogador:", error);

      setError("Não foi possível alterar esse jogador agora.");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const nextName = name.trim();

    if (!nextName) {
      setError("Diga o nome do novo jogador.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onAddPlayer(nextName, photoUrl.trim(), catchphrase.trim());

      setName("");
      setPhotoUrl("");
      setCatchphrase("");
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao cadastrar jogador:", error);

      setError("Não foi possível cadastrar agora.");
    } finally {
      setSaving(false);
    }
  };

  const startPlayerEdit = (player: Player) => {
    setEditingPhraseId(null);

    setEditingPlayerId(player.id);
    setNameDraft(player.name);
    setPhotoDraft(player.photoUrl);
    setError("");
  };

  const cancelPlayerEdit = () => {
    setEditingPlayerId(null);
    setNameDraft("");
    setPhotoDraft("");
    setError("");
  };

  const savePlayer = async (player: Player) => {
    const nextName = nameDraft.trim();

    if (!nextName) {
      setError("O jogador precisa ter um nome.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const avatarSeed = encodeURIComponent(
        nextName.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      );

      const nextPhotoUrl =
        photoDraft.trim() ||
        `https://api.dicebear.com/10.x/thumbs/svg?seed=${avatarSeed}`;

      await onUpdatePlayer(player, {
        name: nextName,
        photoUrl: nextPhotoUrl,
      });

      setEditingPlayerId(null);
      setNameDraft("");
      setPhotoDraft("");
    } catch (error) {
      console.error("Erro ao editar jogador:", error);

      setError("Não foi possível salvar o jogador agora.");
    } finally {
      setSaving(false);
    }
  };

  const startPhraseEdit = (player: Player) => {
    setEditingPlayerId(null);

    setEditingPhraseId(player.id);
    setPhraseDraft(player.catchphrase ?? "");
    setError("");
  };

  const savePhrase = async (player: Player) => {
    setSaving(true);
    setError("");

    try {
      await onUpdatePlayer(player, {
        catchphrase: phraseDraft.trim(),
      });

      setEditingPhraseId(null);
      setPhraseDraft("");
    } catch (error) {
      console.error("Erro ao salvar frase:", error);

      setError("Não foi possível salvar essa frase agora.");
    } finally {
      setSaving(false);
    }
  };

  const editingPlayer = editingPlayerId
    ? (players.find((player) => player.id === editingPlayerId) ?? null)
    : null;

  return (
    <section className="page-wrap inner-page">
      <header className="inner-page-heading">
        <div>
          <p className="eyebrow">A turma da mesa</p>

          <h1>Jogadores</h1>

          <p>
            Fotos, nomes e espaço aberto para quem chegar na próxima rodada.
          </p>
        </div>

        <DominoTile left={3} right={6} label="Peça três seis" />
      </header>

      <div className="players-toolbar">
        <p>
          {players.filter((player) => player.active).length} jogadores ativos
        </p>

        <div className="players-toolbar-actions">
          {onCompare && <button className="button button-secondary" type="button" onClick={onCompare}>Comparar jogadores</button>}
          {editable ? (
            <button className="button button-primary" type="button" onClick={() => setShowForm((visible) => !visible)}><Plus size={19} strokeWidth={3} />Novo jogador</button>
          ) : <span className="access-note">Use o PIN em Nova partida para editar</span>}
        </div>
      </div>

      {error && !showForm && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <form className="add-player-form" onSubmit={submit}>
          <label>
            <span>Nome</span>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: João"
              autoFocus
            />
          </label>

          <label>
            <span>
              URL da foto <small>(opcional)</small>
            </span>

            <input
              type="url"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            <span>
              Frase <small>(opcional)</small>
            </span>

            <input
              maxLength={120}
              value={catchphrase}
              onChange={(event) => setCatchphrase(event.target.value)}
              placeholder="Ex.: Hoje tem baile."
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="button button-secondary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Cadastrar"}
          </button>
        </form>
      )}

      <div className="players-grid">
        {players.map((player, index) => {
          const editingProfile = editingPlayerId === player.id;

          const editingPhrase = editingPhraseId === player.id;

          return (
            <article
              className={player.active ? "player-card" : "player-card inactive"}
              key={player.id}
            >
              <span className="player-index">
                {String(index + 1).padStart(2, "0")}
              </span>

              {editingProfile ? (
                <>
                  <div className="player-profile-editor desktop-profile-editor">
                    <PlayerAvatar
                      name={nameDraft || player.name}
                      photoUrl={photoDraft || player.photoUrl}
                      className="player-card-avatar"
                    />

                    <label>
                      <span>Nome</span>

                      <input
                        value={nameDraft}
                        onChange={(event) => setNameDraft(event.target.value)}
                        maxLength={60}
                        autoFocus
                      />
                    </label>

                    <label>
                      <span>URL da foto</span>

                      <input
                        type="url"
                        value={photoDraft}
                        onChange={(event) => setPhotoDraft(event.target.value)}
                        placeholder="https://..."
                      />
                    </label>

                    <small>
                      Se deixar a foto vazia, será criado um avatar automático.
                    </small>

                    <div className="player-profile-actions">
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={saving}
                        onClick={() => void savePlayer(player)}
                      >
                        <Check size={17} />

                        {saving ? "Salvando..." : "Salvar"}
                      </button>

                      <button
                        className="button"
                        type="button"
                        disabled={saving}
                        onClick={cancelPlayerEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>

                  <div className="mobile-edit-preview" aria-hidden="true">
                    <PlayerAvatar
                      name={nameDraft || player.name}
                      photoUrl={photoDraft || player.photoUrl}
                      className="player-card-avatar"
                    />

                    <h2>{nameDraft || player.name}</h2>

                    <p
                      className={player.catchphrase ? "player-catchphrase" : ""}
                    >
                      {player.catchphrase
                        ? `“${player.catchphrase}”`
                        : player.active
                          ? "Na ativa"
                          : "Fora da mesa"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <PlayerAvatar
                    name={player.name}
                    photoUrl={player.photoUrl}
                    className="player-card-avatar"
                  />

                  <h2>{player.name}</h2>
                  {!isGuestPlayer(player) && onOpenProfile && <button className="player-profile-link" type="button" onClick={() => onOpenProfile(player.id)}>Ver perfil</button>}
                </>
              )}

              {!editingProfile &&
                (editingPhrase ? (
                  <div className="phrase-editor">
                    <label>
                      <span>Frase de {player.name}</span>

                      <input
                        maxLength={120}
                        value={phraseDraft}
                        onChange={(event) => setPhraseDraft(event.target.value)}
                      />
                    </label>

                    <button
                      type="button"
                      aria-label={`Salvar frase de ${player.name}`}
                      disabled={saving}
                      onClick={() => void savePhrase(player)}
                    >
                      <Check size={17} />
                    </button>
                  </div>
                ) : (
                  <p className={player.catchphrase ? "player-catchphrase" : ""}>
                    {player.catchphrase
                      ? `“${player.catchphrase}”`
                      : player.active
                        ? "Na ativa"
                        : "Fora da mesa"}
                  </p>
                ))}

              {editable && !editingProfile && !editingPhrase && (
                <button
                  className="phrase-edit-button"
                  type="button"
                  aria-label={`Editar perfil de ${player.name}`}
                  onClick={() => startPlayerEdit(player)}
                >
                  <Pencil size={15} />
                  Editar perfil
                </button>
              )}

              {editable && !editingProfile && !editingPhrase && (
                <button
                  className="phrase-edit-button"
                  type="button"
                  aria-label={`Editar frase de ${player.name}`}
                  onClick={() => startPhraseEdit(player)}
                >
                  <Pencil size={15} />
                  Frase
                </button>
              )}

              {editable && !editingProfile && !editingPhrase && (
                <button
                  className="player-toggle"
                  type="button"
                  onClick={() => void togglePlayer(player)}
                >
                  {player.active ? (
                    <UserRoundX size={17} />
                  ) : (
                    <UserRoundCheck size={17} />
                  )}

                  {player.active ? "Arquivar" : "Reativar"}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {editingPlayer && (
        <>
          <button
            className="mobile-profile-backdrop"
            type="button"
            aria-label="Fechar edição de perfil"
            onClick={cancelPlayerEdit}
          />

          <aside
            className="mobile-profile-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-profile-sheet-title"
          >
            <span className="mobile-profile-sheet-handle" aria-hidden="true" />

            <header className="mobile-profile-sheet-header">
              <PlayerAvatar
                name={nameDraft || editingPlayer.name}
                photoUrl={photoDraft || editingPlayer.photoUrl}
                className="mobile-profile-sheet-avatar"
              />

              <div>
                <span>Editar jogador</span>
                <h2 id="mobile-profile-sheet-title">
                  {nameDraft || editingPlayer.name}
                </h2>
              </div>

              <button
                className="mobile-profile-sheet-close"
                type="button"
                aria-label="Cancelar edição"
                disabled={saving}
                onClick={cancelPlayerEdit}
              >
                <X size={22} strokeWidth={3} />
              </button>
            </header>

            <div className="mobile-profile-sheet-fields">
              <label>
                <span>Nome</span>

                <input
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  maxLength={60}
                  autoFocus
                />
              </label>

              <label>
                <span>URL da foto</span>

                <input
                  type="url"
                  value={photoDraft}
                  onChange={(event) => setPhotoDraft(event.target.value)}
                  placeholder="https://..."
                />
              </label>

              <small>
                Se deixar a foto vazia, será criado um avatar automático.
              </small>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="mobile-profile-sheet-actions">
              <button
                className="button"
                type="button"
                disabled={saving}
                onClick={cancelPlayerEdit}
              >
                Cancelar
              </button>

              <button
                className="button button-secondary"
                type="button"
                disabled={saving}
                onClick={() => void savePlayer(editingPlayer)}
              >
                <Check size={18} strokeWidth={3} />
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </aside>
        </>
      )}
    </section>
  );
}
