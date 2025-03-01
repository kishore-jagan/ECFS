import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  name: String = '';
  selectedRole: string = '';
  selectedDesignation: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  roleentered: String = '';
  designationEntered: String = '';
  Roles: { id: number; role: string; created_at: string }[] = []; // Example roles
  Designation: { id: number; designation: string; created_at: string }[] = []; // Example positions
  state: string = 'Add';
  users:any[] = [];
  id!: string;
  baseUrl: String = 'http://localhost:3000/api/users/';
  constructor(
    private http: HttpClient,
    // private config: ConfigDataService,
    // private toast: ToastrService,
    private layout:LayoutComponent
  ) {}
  ngOnInit(): void {
    this.layout.page = 'user';
    this.getUsers();
    this.getRoles();
    this.getDesignation();
    this.Roles.push({
      id: 1,
      role: 'Admin',
      created_at: '2022-01-01'
      },
      {
        id: 2,
        role: 'User',
        created_at: '2022-01-01'
      },
      {
        id: 3,
        role: 'Moderator',
        created_at: '2022-01-01'
        }
      );
      this.Designation.push({
        id: 1,
        designation: 'Software Engineer',
        created_at: '2022-01-01'
        },
        {
          id: 2,
          designation: 'Data Scientist',
          created_at: '2022-01-01'
          },  
          {
            id: 3,
            designation: 'Product Manager',
            created_at: '2022-01-01'
          });

          this.users.push(
            {
              id: 1,
              username: 'John Doe',
              role: 'User',
              designation: 'Analyst',
              
              },
              {
                id: 2,
                username: 'Jane Doe',
                role: 'Admin',
                designation: 'Manager',
                },
                {
                  id: 3,
                  username: 'Bob Smith',
                  role: 'User',
                  designation: 'Researcher',
                  }
            
                  );

              

          
  }

  editUser() {
    const editUser = {
      id: this.id,
      name: this.name,
      username: this.username,
      role: this.selectedRole,
      designation: this.selectedDesignation,
      email: this.email,
      password: this.password,
    };
    this.http.post('http://localhost:3000/api/users/edit', editUser).subscribe({
      next: (response: any) => {
        this.getUsers();
        // this.toast.success(`User ${editUser.name} edited`, 'Success');
        this.resetForm();
        this.state = 'Add';
      },
      error: (err) => {
        // this.toast.error(`Error editing user ${editUser.name}`, 'Error');
      },
    });
  }
  naaavigate() {
    if (this.state == 'Add') {
      this.registerUser();
    } else if (this.state == 'Edit') {
      this.editUser();
    }
  }

  preEdit(users: any) {
    this.state = 'Edit';
    this.name = users['name'];
    this.username = users['username'];
    this.password = '';
    this.selectedRole = users['role'];
    this.selectedDesignation = users['designation'];
    this.email = users['email'];
    this.id = users['id'];
  }
  registerUser() {
    const newUser = {
      id: this.id,
      name: this.name,
      username: this.username,
      role: this.selectedRole,
      designation: this.selectedDesignation,
      email: this.email,
      password: this.password,
    };

    // Send the new user data to your backend API
    this.http
      .post('http://localhost:3000/api/users/register', newUser)
      .subscribe({
        next: (response: any) => {
          this.getUsers();
          // this.toast.success(`User ${this.name} Created`, 'Sucess');
          this.resetForm();
        },
        error: (error) => {
          // this.toast.error('Error registering user. Please try again.'); // Show error message
        },
      });
  }

  getUsers() {
    this.http.get('http://localhost:3000/api/users').subscribe(
      (response: any) => {
        this.users = response;
      },
      (error) => {}
    );
  }
  getRoles() {
    this.http.get('http://localhost:3000/api/users/getroles').subscribe(
      (response: any) => {
        this.Roles = response;
      },
      (error) => {}
    );
  }
  addRole() {
    const newrole = {
      role: this.roleentered,
    };
    this.http
      .post('http://localhost:3000/api/users/addrole', newrole)
      .subscribe({
        next: (response: any) => {
          this.getRoles();
          // this.addLog(`Added new role (${this.roleentered}) `);
          // this.toast.success(`Role ${newrole.role} Added`, 'Success');
        },
        error: (error) => {
          // this.toast.error(`Error adding ${newrole.role}`, 'Please try again');
        },
      });
  }

  // addLog(logData: string) {
  //   const newlog = {
  //     log: logData,
  //   };

  //   this.config.AddLog(newlog).subscribe(
  //     (response) => {},
  //     (error) => {}
  //   );
  // }

  addDesignation() {
    const newdesignation = {
      designation: this.selectedDesignation,
    };
    this.http
      .post('http://localhost:3000/api/users/adddesignation', newdesignation)
      .subscribe({
        next: (response: any) => {
          this.getDesignation();
          // this.toast.success(
          //   `Designation ${newdesignation.designation} Added`,
          //   'Success'
          // );
        },
        error: (error) => {
          // this.toast.error(
          //   `Error adding ${newdesignation.designation}`,
          //   'Please try again'
          // );
        },
      });
  }
  getDesignation() {
    this.http.get('http://localhost:3000/api/users/getdesignation').subscribe(
      (response: any) => {
        this.Designation = response;
      },
      (error) => {}
    );
  }

  DeleteRole(id: number) {
    this.http
      .delete(`http://localhost:3000/api/users/deleteRole/${id}`)
      .subscribe({
        next: (response) => {
          this.getRoles();
          // this.toast.success(`Role deleted`, 'Success');
        },
        error: (error) => {
          // this.toast.error('Error deleting role', 'Please try again');
        },
      });
  }
  Deleteuser(id: number) {
    this.http
      .delete(`http://localhost:3000/api/users/deleteUser/${id}`)
      .subscribe({
        next: (response) => {
          this.getUsers();
          // this.toast.success(`User deleted`, 'Success');
        },
        error: (error) => {
          // this.toast.error('Error deleting User', 'Please try again');
        },
      });
  }
  //delete desig
  DeleteDesignation(id: number) {
    this.http
      .delete(`http://localhost:3000/api/users/deleteDesignation/${id}`)
      .subscribe({
        next: (response) => {
          this.getDesignation();
          // this.toast.success(`Designation deleted`, 'Success');
        },
        error: (error) => {
          console.error('Error deleting Designation', error);
          // this.toast.error('Error deleting Designation', 'Please try again');
        },
      });
  }
  resetForm() {
    this.name = '';
    this.username = '';
    this.email = '';
    this.password = '';
    this.selectedRole = '';
    this.selectedDesignation = '';
  }
}
