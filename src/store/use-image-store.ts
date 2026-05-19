import { create } from 'zustand';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
}

interface ImageStore {
  images: UploadedImage[];
  isGenerating: boolean;
  resultImage: string | null;
  selectedAgent: string;
  setAgent: (agent: string) => void;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  setGenerating: (status: boolean) => void;
  setResult: (url: string | null) => void;
  updateProgress: (id: string, progress: number) => void;
  clearImages: () => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  isGenerating: false,
  resultImage: null,
  selectedAgent: "gpt image-5",
  setAgent: (agent) => set({ selectedAgent: agent }),
  addImages: (files) => {
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'idle' as const,
      progress: 0,
    }));
    set((state) => ({ images: [...state.images, ...newImages] }));
  },
  removeImage: (id) => {
    set((state) => {
      const imageToRemove = state.images.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return { images: state.images.filter((img) => img.id !== id) };
    });
  },
  setGenerating: (status) => set({ isGenerating: status }),
  setResult: (url) => set({ resultImage: url }),
  updateProgress: (id, progress) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, progress } : img
      ),
    }));
  },
  clearImages: () => {
    set((state) => {
      state.images.forEach((img) => URL.revokeObjectURL(img.preview));
      return { images: [] };
    });
  },
}));
