export async function GET(request) {
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  const { searchParams } = new URL(request.url);
  const folder = searchParams?.get("folder");
  const fileName = searchParams?.get("name");
  let backendResponse = await fetch(
    `${url}/file/${folder}/${encodeURIComponent(fileName)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return backendResponse;
}
