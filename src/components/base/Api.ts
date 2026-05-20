export type ApiListResponse<Type> = {
  total: number;
  items: Type[];
};

export class Api {
  readonly baseUrl: string;
  protected options: RequestInit;

  constructor(baseUrl: string, options: RequestInit = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      headers: {
        'Content-Type': 'application/json',
        ...((options.headers as object) ?? {}),
      },
    };
  }

  protected async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error(response.statusText || 'API request failed');
    }
    
    const data = await response.json();
    
    // Validate response has items field or is array-like
    if (!data || (typeof data === 'object' && data.items === undefined && !Array.isArray(data))) {
      throw new Error('Invalid API response: missing items');
    }
    
    return data;
  }

  async get(uri: string) {
    return fetch(this.baseUrl + uri, {
      ...this.options,
      method: 'GET',
    })
      .catch((err) => {
        throw new Error(`Failed to fetch from ${this.baseUrl + uri}: ${err.message}`);
      })
      .then(this.handleResponse.bind(this));
  }

  async post(uri: string, data: object, skipValidation = false) {
    return fetch(this.baseUrl + uri, {
      ...this.options,
      method: 'POST',
      body: JSON.stringify(data),
    })
      .catch((err) => {
        throw new Error(`Failed to fetch from ${this.baseUrl + uri}: ${err.message}`);
      })
      .then((response) => {
        if (skipValidation) {
          if (!response.ok) {
            throw new Error(response.statusText || 'API request failed');
          }
          return response.json();
        }
        return this.handleResponse(response);
      });
  }
}
