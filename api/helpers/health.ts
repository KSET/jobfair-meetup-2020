import HealthService from "../services/health-service";

let health: HealthService | null = null;
(async () => {
  health = await HealthService.start();
})();

export default function isLive(): boolean {
  return true === health?.isLive;
}
