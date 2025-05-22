const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gramedia-koperasi-api.onrender.com';

export interface ApiResponse<T> {
  data: T;
}

const handleResponse = async <T>(
  response: Response,
): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  // Check if the status code is 201 (Created) with an empty response body
  if (
    response.status === 201 &&
    response.headers.get('content-length') === '0'
  ) {
    return {data: {}} as ApiResponse<T>;
  }

  if (response.status === 403) {
    throw new Error('Unauthorized'); // Throw error to stop further execution
  }

  const data = await response.json();
  return {data} as ApiResponse<T>;
};

export const API = async <T>(
  endpoint: string,
  method: string = 'GET',
  params: Record<string, any> = {},
  bearerToken?: string, // Optional bearer token
): Promise<ApiResponse<T>> => {
  let url = `${API_URL}/${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Add any additional headers if needed
  };

  // Append query parameters to the URL for GET requests
  Object.keys(params).map((key) => {
    url = url.replaceAll(`:${key}`, params[key]);
  });

  // Include Authorization header with Bearer token if provided
  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (method === 'POST' && params) {
    config.body = JSON.stringify(params);
  }

  try {
    const response = await fetch(url, config);
    return handleResponse<T>(response);
  } catch (error) {
    console.error({url, config});
    throw new Error('Network error. Please try again.');
  }
};