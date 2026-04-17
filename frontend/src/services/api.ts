const API_BASE_URL = 'http://localhost:4000/api';

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface BookData {
  title: string;
  authorId: string;
  publisherId?: string;
  categoryId: string;
  isbn: string;
  quantity: number;
  available: number;
  coverImage?: string;
  description?: string;
  publishedYear: number;
}

interface TransactionData {
  userId: string;
  bookId: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text().then(text => text ? JSON.parse(text) : { error: 'Network error' }).catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.status === 204 ? undefined : response.json();
  }

  // Auth endpoints
  async login(data: LoginData) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async signup(data: SignupData) {
    const result = await this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Books endpoints
  async getBooks() {
    return this.request<any[]>('/books');
  }

  async getBook(id: string) {
    return this.request<any>(`/books/${id}`);
  }

  async createBook(data: BookData) {
    return this.request<any>('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBook(id: string, data: Partial<BookData>) {
    return this.request<any>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBook(id: string) {
    return this.request<void>(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints
  async getUsers() {
    return this.request<any[]>('/users');
  }

  // Authors endpoints
  async getAuthors() {
    return this.request<any[]>('/authors');
  }

  async createAuthor(data: { name: string; bio?: string; nationality?: string; birthDate?: string; deathDate?: string }) {
    return this.request<any>('/authors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAuthor(id: string, data: Partial<{ name: string; bio?: string; nationality?: string; birthDate?: string; deathDate?: string }>) {
    return this.request<any>(`/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAuthor(id: string) {
    return this.request<void>(`/authors/${id}`, {
      method: 'DELETE',
    });
  }

  // Publishers endpoints
  async getPublishers() {
    return this.request<any[]>('/publishers');
  }

  async createPublisher(data: { name: string; address?: string; phone?: string; email?: string; website?: string }) {
    return this.request<any>('/publishers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePublisher(id: string, data: Partial<{ name: string; address?: string; phone?: string; email?: string; website?: string }>) {
    return this.request<any>(`/publishers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePublisher(id: string) {
    return this.request<void>(`/publishers/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async createCategory(data: { name: string; parentId?: string }) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<{ name: string; parentId?: string }>) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions endpoints
  async getTransactions() {
    return this.request<any[]>('/transactions');
  }

  async getUserTransactions(userId: string) {
    return this.request<any[]>(`/transactions/user/${userId}`);
  }

  async borrowBook(data: TransactionData) {
    return this.request<any>('/transactions/borrow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async issueBook(data: TransactionData) {
    return this.request<any>('/transactions/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async returnBook(transactionId: string) {
    return this.request<any>(`/transactions/return/${transactionId}`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();