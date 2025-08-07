import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Client } from '../models';

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