import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function synthesizeImages(images: { file: File }[]) {
  if (!API_KEY || API_KEY === "your_api_key_here") {
    return { success: false, error: "Gemini API Key is missing. Please add it to your .env.local file." };
  }

  if (images.length === 0) {
    return { success: false, error: "No images provided for synthesis." };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageParts = await Promise.all(
      images.map(async (img) => {
        try {
          const base64 = await fileToGenerativePart(img.file);
          return base64;
        } catch {
          throw new Error(`Failed to process image ${img.file.name}. Ensure it is a valid image file.`);
        }
      })
    );

    const prompt = `Merge multiple bracketed exposure images of the exact same interior or architectural scene into ONE ultra-realistic professional real-estate photograph.

The uploaded images represent different exposure levels of the same camera position and composition. Perform intelligent multi-exposure HDR fusion by extracting the best lighting, shadow, texture, and highlight information from each exposure while preserving complete photorealism and architectural accuracy.

Use:

darker exposures for highlight retention, window recovery, exterior visibility, and bright-area detail preservation
balanced exposures for natural midtones, scene consistency, and realistic color transitions
brighter exposures for shadow recovery, interior visibility, texture restoration, and ambient light enhancement

Generate a final image that looks like a professionally captured and expertly retouched luxury real-estate photograph created using high-end DSLR exposure blending techniques.

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
fake depth of field`;

    let attempts = 0;
    let result;
    
    while (attempts < 3) {
      try {
        result = await model.generateContent([prompt, ...imageParts]);
        break;
      } catch (error) {
        attempts++;
        const errStr = String(error).toLowerCase();
        
        if ((errStr.includes("quota") || errStr.includes("429")) && attempts < 3) {
          const waitTime = attempts * 2000;
          console.log(`Gemini Rate Limited. Retrying in ${waitTime}ms (Attempt ${attempts}/3)...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw error;
      }
    }

    const response = await result.response;
    
    if (!response) {
      return { success: false, error: "AI synthesis failed to return a response. Please try again." };
    }

    const synthesizedPrompt = response.text();
    
    if (!synthesizedPrompt) {
      return { success: false, error: "AI was unable to generate a synthesis prompt from these images." };
    }

    return {
      success: true,
      prompt: synthesizedPrompt,
    };
  } catch (error) {
    console.error("AI Synthesis Error Details:", error);
    
    let errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during AI synthesis.";
    
    const errStr = String(error).toLowerCase();
    if (errStr.includes("quota") || errStr.includes("429")) {
      errorMessage = "Gemini API Quota exceeded. Please try again in a few minutes, or switch to the OpenAI agent in the sidebar!";
    } else if (errStr.includes("api key") || errStr.includes("401")) {
      errorMessage = "Invalid API Key. Please check your Gemini API settings.";
    } else if (errStr.includes("block") || errStr.includes("safety")) {
      errorMessage = "The content was flagged by safety filters. Please try with different images.";
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    },
  };
}
