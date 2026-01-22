export async function GET(request: Request) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return new Response('Hello, from API!');
}
