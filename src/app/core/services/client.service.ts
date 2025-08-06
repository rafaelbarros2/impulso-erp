import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  address?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseApiService {
  private endpoint = '/clients';

  getAllClients(): Observable<Client[]> {
    return this.get<Client[]>(this.endpoint);
  }

  getClientById(id: number): Observable<Client> {
    return this.get<Client>(`${this.endpoint}/${id}`);
  }

  createClient(client: Client): Observable<Client> {
    return this.post<Client>(this.endpoint, client);
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.put<Client>(`${this.endpoint}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}