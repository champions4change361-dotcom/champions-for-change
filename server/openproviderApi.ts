// Openprovider API integration for Champions for Change domain reseller services
import axios, { AxiosInstance } from 'axios';

interface OpenproviderConfig {
  apiUrl: string;
  username: string;
  password: string;
  environment: 'test' | 'live';
}

interface DomainSearchResult {
  name: string;
  premium: boolean;
  price: number;
  currency: string;
  available: boolean;
  reason?: string;
}

interface DomainRegistrationData {
  domainName: string;
  period: number; // years
  ownerContact: ContactData;
  adminContact: ContactData;
  techContact: ContactData;
  billingContact: ContactData;
  nameServers: string[];
  autoRenew: boolean;
}

interface ContactData {
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
}

class OpenproviderService {
  private api: AxiosInstance;
  private token: string | null = null;
  private config: OpenproviderConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.OPENPROVIDER_API_URL || 'https://api.openprovider.eu',
      username: process.env.OPENPROVIDER_USERNAME || '',
      password: process.env.OPENPROVIDER_PASSWORD || '',
      environment: (process.env.OPENPROVIDER_ENV as 'test' | 'live') || 'test',
    };

    this.api = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.api.interceptors.request.use(async (config) => {
      if (!this.token) {
        await this.authenticate();
      }
      config.headers.Authorization = `Bearer ${this.token}`;
      return config;
    });
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await this.api.post('/v1beta/auth/login', {
        username: this.config.username,
        password: this.config.password,
      });

      this.token = response.data.data.token;
    } catch (error) {
      console.error('Openprovider authentication failed:', error);
      throw new Error('Failed to authenticate with Openprovider');
    }
  }

  // Search for available domains
  async searchDomains(searchTerm: string, tlds: string[] = ['.com', '.org', '.net']): Promise<DomainSearchResult[]> {
    try {
      const response = await this.api.post('/v1beta/domains/check', {
        domains: tlds.map(tld => ({
          name: searchTerm,
          extension: tld,
        })),
      });

      return response.data.data.results.map((result: any) => ({
        name: `${result.domain.name}${result.domain.extension}`,
        premium: result.premium,
        price: result.price ? parseFloat(result.price.product.price) : 0,
        currency: result.price ? result.price.product.currency : 'USD',
        available: result.status === 'free',
        reason: result.reason,
      }));
    } catch (error) {
      console.error('Domain search failed:', error);
      throw new Error('Failed to search domains');
    }
  }

  // Register a domain
  async registerDomain(data: DomainRegistrationData): Promise<{ success: boolean; domainId?: string; error?: string }> {
    try {
      const response = await this.api.post('/v1beta/domains', {
        domain: {
          name: data.domainName.split('.')[0],
          extension: '.' + data.domainName.split('.').slice(1).join('.'),
        },
        period: data.period,
        owner_handle: await this.createContact(data.ownerContact),
        admin_handle: await this.createContact(data.adminContact),
        tech_handle: await this.createContact(data.techContact),
        billing_handle: await this.createContact(data.billingContact),
        name_servers: data.nameServers.map(ns => ({ name: ns })),
        auto_renew: data.autoRenew,
      });

      return {
        success: true,
        domainId: response.data.data.id,
      };
    } catch (error: any) {
      console.error('Domain registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.desc || 'Registration failed',
      };
    }
  }

  // Create contact handle for domain registration
  private async createContact(contact: ContactData): Promise<string> {
    try {
      const response = await this.api.post('/v1beta/contacts', {
        first_name: contact.firstName,
        last_name: contact.lastName,
        company_name: contact.companyName || '',
        email: contact.email,
        phone: contact.phone,
        address: {
          street: contact.address.street,
          city: contact.address.city,
          state: contact.address.state,
          zipcode: contact.address.zipcode,
          country: contact.address.country,
        },
      });

      return response.data.data.handle;
    } catch (error) {
      console.error('Contact creation failed:', error);
      throw new Error('Failed to create contact');
    }
  }

  // Get domain information
  async getDomainInfo(domainId: string): Promise<any> {
    try {
      const response = await this.api.get(`/v1beta/domains/${domainId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get domain info:', error);
      throw new Error('Failed to retrieve domain information');
    }
  }

  // Update domain nameservers
  async updateNameservers(domainId: string, nameservers: string[]): Promise<boolean> {
    try {
      await this.api.put(`/v1beta/domains/${domainId}/nameservers`, {
        name_servers: nameservers.map(ns => ({ name: ns })),
      });
      return true;
    } catch (error) {
      console.error('Failed to update nameservers:', error);
      return false;
    }
  }

  // Renew domain
  async renewDomain(domainId: string, period: number): Promise<boolean> {
    try {
      await this.api.post(`/v1beta/domains/${domainId}/renew`, {
        period,
      });
      return true;
    } catch (error) {
      console.error('Domain renewal failed:', error);
      return false;
    }
  }

  // Transfer domain
  async transferDomain(domainName: string, authCode: string, period: number): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      const response = await this.api.post('/v1beta/domains/transfer', {
        domain: {
          name: domainName.split('.')[0],
          extension: '.' + domainName.split('.').slice(1).join('.'),
        },
        auth_code: authCode,
        period,
      });

      return {
        success: true,
        transferId: response.data.data.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.desc || 'Transfer failed',
      };
    }
  }

  // Get pricing for domains
  async getDomainPricing(tld: string): Promise<{ register: number; renew: number; transfer: number; currency: string }> {
    try {
      const response = await this.api.get(`/v1beta/tlds/${tld}/pricing`);
      const pricing = response.data.data;
      
      return {
        register: parseFloat(pricing.create_price),
        renew: parseFloat(pricing.renew_price),
        transfer: parseFloat(pricing.transfer_price),
        currency: pricing.currency,
      };
    } catch (error) {
      console.error('Failed to get domain pricing:', error);
      throw new Error('Failed to retrieve domain pricing');
    }
  }
}

export const openproviderService = new OpenproviderService();
export type { DomainSearchResult, DomainRegistrationData, ContactData };