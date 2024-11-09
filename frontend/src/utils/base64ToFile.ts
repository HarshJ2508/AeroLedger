/**
 * Converts a base64 string to a File object
 * @param base64String - The base64 string to convert (including data URL prefix)
 * @param fileName - The name to give the resulting file
 * @returns Promise<File> - A File object containing the converted data
 * @throws Error if the base64 string is invalid or conversion fails
 */
export const base64ToFile = async (
    base64String: string,
    fileName: string
  ): Promise<File> => {
    try {
      // Extract the base64 data (remove data URL prefix if present)
      const base64Data = base64String.split(',')[1] || base64String;
      
      // Convert base64 to binary
      const binaryData = atob(base64Data);
      
      // Create an array buffer from the binary data
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Fill the array with the binary data
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      
      // Detect MIME type from the data URL
      let mimeType = 'image/png'; // default
      if (base64String.startsWith('data:')) {
        mimeType = base64String.split(';')[0].split(':')[1];
      }
      
      // Create a Blob from the array buffer
      const blob = new Blob([arrayBuffer], { type: mimeType });
      
      // Create and return a File object
      return new File([blob], fileName, { type: mimeType });
    } catch (error) {
      throw new Error(`Failed to convert base64 to File: ${error}`);
    }
  };