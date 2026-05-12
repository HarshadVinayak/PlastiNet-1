import { create } from 'zustand';

interface UploadState {
  isUploading: boolean;
  uploadProgress: number;
  setUploading: (status: boolean) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  isUploading: false,
  uploadProgress: 0,
  setUploading: (status) => set({ isUploading: status }),
  setProgress: (progress) => set({ uploadProgress: progress }),
  reset: () => set({ isUploading: false, uploadProgress: 0 }),
}));
