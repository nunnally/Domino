import type { PlayerScorePoint } from "../../lib/types";

export interface PlayerScoreSeries {
  id: string;
  label: string;
  photoUrl: string;
  points: PlayerScorePoint[];
  color?: string;
}

interface PlayerScoreChartProps {
  label: string;
  points?: PlayerScorePoint[];
  series?: PlayerScoreSeries[];
}

const chartWidth = 680;
const chartHeight = 260;
const pad = { top: 22, right: 22, bottom: 34, left: 44 };

export function PlayerScoreChart({ label, points, series }: PlayerScoreChartProps) {
  const normalizedSeries = series ?? [{ id: "player", label, photoUrl: "", points: points ?? [] }];
  const allPoints = normalizedSeries.flatMap((item) => item.points);

  if (allPoints.length === 0) {
    return (
      <div className="player-chart player-chart-empty" role="img" aria-label={label}>
        <span>Ainda não há partidas suficientes para desenhar o histórico.</span>
      </div>
    );
  }

  const maxIndex = Math.max(...normalizedSeries.map((item) => item.points.length - 1), 1);
  const x = (index: number) => pad.left + (index / maxIndex) * (chartWidth - pad.left - pad.right);
  const y = (score: number) => pad.top + ((100 - score) / 100) * (chartHeight - pad.top - pad.bottom);

  return (
    <div className="player-chart-wrap">
      <svg className="player-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={label}>
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line className="player-chart-grid" x1={pad.left} x2={chartWidth - pad.right} y1={y(tick)} y2={y(tick)} />
            <text className="player-chart-axis" x={pad.left - 10} y={y(tick) + 4} textAnchor="end">{tick}</text>
          </g>
        ))}
        {normalizedSeries.map((item, seriesIndex) => {
          const pointsString = item.points.map((point, index) => `${x(index)},${y(point.score)}`).join(" ");
          return (
            <g key={item.id}>
              <polyline className="player-chart-line" style={{ stroke: item.color ?? (seriesIndex === 0 ? "#000" : "#ff6b6b") }} points={pointsString} />
              {item.points.map((point, index) => (
                <circle key={`${item.id}-${point.gameId}`} className="player-chart-point" style={{ fill: point.result === "win" ? "#ffd93d" : "#ff6b6b" }} cx={x(index)} cy={y(point.score)} r="5">
                  <title>{`${item.label}: ${point.score} (${point.result === "win" ? "vitória" : "derrota"})`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="player-chart-legend">
        {normalizedSeries.map((item, index) => (
          <span key={item.id}><i style={{ background: item.color ?? (index === 0 ? "#000" : "#ff6b6b") }} />{item.label}</span>
        ))}
      </div>
    </div>
  );
}
