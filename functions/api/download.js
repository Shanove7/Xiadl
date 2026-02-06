export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const url = body.url;
    const platform = body.platform;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let endpoint = "https://kyzoymd-downloader.vercel.app/api/download";
    let apiUrl = platform ? endpoint : `${endpoint}?url=${encodeURIComponent(url)}`;
    
    let fetchOptions = {
      method: platform ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (platform) {
      fetchOptions.body = JSON.stringify({ url, platform });
    }

    const res = await fetch(apiUrl, fetchOptions);
    const data = await res.json();

    if (!data.success) throw new Error("Download failed");

    let result = data.results?.[0] || {};
    
    const responseData = {
      status: true,
      platform: data.platform,
      original_url: data.original_url,
      title: result.title || null,
      thumbnail: result.thumbnail || null,
      duration: result.duration || null,
      author: result.author || null,
      download: {
        video: result.hd_url || result.download_url || null,
        audio: result.music || null,
        image: result.thumbnail || null,
        raw: result
      },
      raw: data
    };

    return new Response(JSON.stringify(responseData), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ status: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
