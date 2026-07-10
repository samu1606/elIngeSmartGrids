export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("elingesmartgrids.cloud")) {
      return "https://api.elingesmartgrids.cloud";
    }
    // Si es localhost o IP directa, usar la IP del VPS
    if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("192.168.")) {
      return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    }
    // Cualquier otro dominio (IP del VPS, etc.)
    // Asumimos que la API está en el mismo host en puerto 8005
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}:8005`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};
