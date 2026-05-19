const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

export async function generateOpenAIImage(images: { file: File }[]) {
  if (!apiKey) {
    return { success: false, error: "OpenAI API Key is missing." };
  }

  try {
    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append(
      "prompt",
      `
Merge multiple bracketed exposure images of the exact same interior or architectural scene into ONE ultra-realistic professional real-estate photograph.

The uploaded images represent different exposure levels of the same camera position and composition. Perform intelligent multi-exposure HDR fusion by extracting the best lighting, shadow, texture, and highlight information from each exposure while preserving complete photorealism and architectural accuracy.

Use:

darker exposures for highlight retention, window recovery, exterior visibility, and bright-area detail preservation
balanced exposures for natural midtones, scene consistency, and realistic color transitions
brighter exposures for shadow recovery, interior visibility, texture restoration, and ambient light enhancement

Generate a final image that looks like a professionally captured and real-estate photograph created using high-end DSLR exposure blending techniques.

Core Objectives

Create:

natural HDR fusion
realistic dynamic range
bright yet believable interiors
balanced indoor and outdoor exposure
soft natural daylight
premium real-estate photography aesthetics
clean architectural presentation
realistic textures and materials
crisp but natural detail clarity
spacious and airy room appearance

The final image must feel:

photorealistic
professionally photographed
MLS-quality
Zillow/Realtor-style
high-end interior photography grade
naturally lit and visually clean
Window & Highlight Recovery (Highest Priority)

Recover all blown-out window and exterior details using darker exposure data.

Preserve:

outdoor visibility
sky brightness balance
exterior structures
balcony or landscape details
realistic daylight intensity
clean window edges

Avoid:

fake sky replacement
unrealistic exterior sharpness
HDR halos around windows
clipped highlights
unnatural brightness transitions

The interior and exterior brightness relationship must remain physically believable.

Shadow Recovery & Interior Balancing

Lift shadows naturally using brighter exposure data while maintaining depth and realism.

Recover details in:

flooring
walls
corners
ceilings
cabinetry
furniture
underexposed architectural areas

Avoid:

flat lighting
crushed blacks
excessive shadow lifting
washed-out contrast
fake ambient glow

Maintain subtle depth shadows for realistic spatial perception.

Color Correction & Tone Balancing

Apply professional real-estate color correction with:

neutral white balance
accurate material colors
clean white walls and ceilings
natural wood tones
soft daylight-balanced ambience
realistic warm-neutral interior lighting

Remove:

yellow cast
orange tint
green tint
magenta cast
blue overcorrection
mixed-light color contamination

Avoid:

cinematic grading
aggressive HDR colors
oversaturation
artificial vibrance
stylized color processing
Detail Enhancement & Image Quality

Enhance image quality while preserving realism.

Improve:

architectural edges
flooring texture
cabinetry definition
material realism
furniture textures
fine interior details
natural sharpness

Apply:

subtle structural sharpening
edge-preserving enhancement
clean denoising
high-frequency texture recovery
realistic clarity optimization

Avoid:

over sharpening
crunchy textures
plastic surfaces
watercolor artifacts
AI-generated fake textures
excessive microcontrast

Output requirements:

ultra high definition
DSLR-quality realism
print-quality detail
smooth gradients
clean exposure transitions
luxury real-estate presentation quality
Reflection & Glare Control

Reduce excessive glare and harsh reflections on:

countertops
glossy furniture
appliances
framed artwork
polished surfaces
windows

Maintain natural reflective behavior without removing realistic material properties.

Structural Preservation (Critical)

STRICTLY preserve:

original room geometry
camera perspective
lens proportions
architectural alignment
furniture placement
decor positioning
object shapes
room dimensions
wall structure
ceiling structure
flooring alignment

DO NOT:

add objects
remove objects
replace furniture
modify decor
hallucinate details
alter room layout
warp geometry
distort perspective
change focal length appearance
generate fake staging

This is an enhancement and exposure-fusion task, NOT a scene generation task.

Realism Constraints

The final image must resemble a naturally captured professional photograph — not an AI-generated render.

Avoid:

fake HDR appearance
halo artifacts
overprocessed shadows
unrealistic brightness
artificial lighting
dreamy rendering
cinematic mood grading
exaggerated contrast
painterly textures
CGI appearance
excessive smoothing
unrealistic sharpness
synthetic detail generation

The output should look like:

a high-end manually edited real-estate photograph
professionally blended exposure brackets
luxury property marketing photography
Negative Prompt

Do NOT generate:

hallucinated objects
geometry distortion
fake reflections
duplicated furniture
missing objects
warped architectural lines
overexposed highlights
clipped whites
crushed blacks
halo artifacts
fake sunlight rays
unrealistic HDR
artificial bloom
oversaturation
cartoon textures
painterly effects
CGI-style rendering
excessive denoise smoothing
unrealistic shadows
fake depth of field`
    );
    formData.append("size", "1536x1024");
    formData.append("n", "1");

    for (const img of images) {
      formData.append("image[]", img.file);
    }

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return { success: false, error: "OpenAI failed to generate an image." };
    }

    const firstImage = data.data[0];
    const imageUrl =
      firstImage?.url ||
      (firstImage?.b64_json ? `data:image/png;base64,${firstImage.b64_json}` : null);

    if (!imageUrl) {
      return { success: false, error: "OpenAI returned no image URL or base64 payload." };
    }

    return {
      success: true,
      url: imageUrl
    };
  } catch (error) {
    console.error("OpenAI Image Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred during OpenAI image generation.";
    return {
      success: false,
      error: errorMessage
    };
  }
}
