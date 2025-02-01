import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div>
      <button (click)="login()">Login</button>
      <button (click)="callApi()">Call API</button>
      <button (click)="logout()">Logout</button>
      <pre>{{ results }}</pre>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  results: any;

  constructor(private http: HttpClient) {}

  login() {
    // Redirect to the BFF login endpoint
    window.location.href = "/api/auth/login";
  }

  callApi() {
    // Call the BFF proxy endpoint
    this.http
      .post("/api/proxy", {
        url: "https://localhost:6001/graphql/graphql?core=aba&event=association&lang=en&associationCode=aba",
        method: "POST",
        body: JSON.stringify({
          query: `
            {
              companyMembership(companyId: 2254) {
                balance
                joinDate
                paidThruDate
                duesCategory
                ownerCompany
                membershipType
                expirationDate
              }
            }
          `,
        }),
      })
      .subscribe(
        (data) => {
          this.results = JSON.stringify(data, null, 2);
        },
        (error) => {
          this.results = JSON.stringify(error, null, 2);
        }
      );
  }

  logout() {
    // Redirect to the BFF logout endpoint
    window.location.href = "/api/auth/logout";
  }
}
