export interface GenerateRequest {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
}

export interface GenerateResponse {
  success: boolean;
  image?: string;
  error?: string;
}
