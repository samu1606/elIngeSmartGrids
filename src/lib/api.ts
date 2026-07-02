export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("elingesmartgrids.cloud")) {
      return "https://api.elingesmartgrids.cloud";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};
