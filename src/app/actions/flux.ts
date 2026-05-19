"use server"

const BFL_API_KEY = process.env.NEXT_PUBLIC_BFL_API_KEY || "";

export async function generateFluxImageAction(prompt: string) {
  if (!BFL_API_KEY || BFL_API_KEY === "your_api_key_here") {
    return { success: false, error: "BFL API Key is missing on the server." };
  }

  try {
    const response = await fetch("https://api.bfl.ai/v1/flux-pro-1.1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-key": BFL_API_KEY,
      },
      body: JSON.stringify({
        prompt: prompt,
        width: 1024,
        height: 768,
        prompt_upsampling: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.detail || errorData.message || response.statusText;
      return { success: false, error: `Flux Submission Failed: ${msg}` };
    }

    const taskData = await response.json();
    if (!taskData.id) {
      return { success: false, error: "BFL API did not return a Task ID." };
    }

    const imageUrl = await pollFluxResult(taskData.id);
    return { success: true, url: imageUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred on the server.";
    console.error("Flux Server Error:", error);
    return { success: false, error: errorMessage };
  }
}

async function pollFluxResult(taskId: string): Promise<string> {
  const maxRetries = 45;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(`https://api.bfl.ai/v1/get_result?id=${taskId}`, {
        headers: {
          "x-key": BFL_API_KEY,
        },
      });

      const data = await response.json();

      if (data.status === "Ready" && data.result?.sample) {
        return data.result.sample;
      }

      if (data.status === "Failed") {
        throw new Error(`BFL synthesis failed: ${data.error || "Generation error"}`);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("Polling attempt failed, retrying...", errMsg);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    retries++;
  }

  throw new Error("BFL generation timed out.");
}
