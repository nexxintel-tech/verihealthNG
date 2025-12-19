export default async function handler(req: Request): Promise<Response> {
  // Handle preflight / OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      },
    });
  }

  // Only accept POST for data ingestion
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, message: "POST only" }), { status: 405 });
  }

  // Read the JSON payload
  const data = await req.json();

  // For now, just log it (we’ll save to database next)
  console.log("Received wearable data:", data);

  return new Response(JSON.stringify({ ok: true, phase: "G", received: data }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
