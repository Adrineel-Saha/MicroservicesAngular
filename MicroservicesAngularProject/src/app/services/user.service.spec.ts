import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { MockUsers } from '../mockdata/user.mock';

describe('UserService', () => {
  let userService: UserService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:9191/api/users';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      providers: [UserService]
    });

    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify(); 
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('should return all users and return 200 status (getAllUsers)', () => {
    userService.getAllUsers().subscribe(response => {
      expect(response.body).toEqual(MockUsers);
      expect(response.body?.length).toBe(5);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('Ok');
    });
  
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(MockUsers, {status:200 , statusText: 'Ok'});
  });

  it('should handle 400 Bad Request (getAllUsers)', () => {
    userService.getAllUsers().subscribe({
      next: () => fail('should fail'),
      error: (error) => {
        expect(error.error).toBe('User List is Empty');
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      }
    });
  
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush('User List is Empty', {status: 400, statusText: 'Bad Request'});
  });

  it('should return a single user and return 200 status (getUser)', () => {
    const userId = 1;
    const mockUser = MockUsers[0]; // first user
  
    userService.getUser(userId).subscribe(response => {
      expect(response.body).toEqual(mockUser);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('Ok');
    });
  
    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser, { status: 200, statusText: 'Ok'});
  });

  it('should handle 404 Not Found (getUser)', () => {
    const userId = 999;
  
    userService.getUser(userId).subscribe({
      next: () => fail('should fail for 404'),
      error: (error) => {
        expect(error.error).toBe('User not found with Id: ' + userId);
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      }
    });
  
    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('GET');
    req.flush('User not found with Id: ' + userId, { status: 404, statusText: 'Not Found'});
  });

  it('should handle 400 Bad Request (getUser)', () => {
    const userId = -1;
  
    userService.getUser(userId).subscribe({
      next: () => fail('should fail for 400'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error).toBe('Invalid user ID');
      }
    });
  
    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('GET');
    req.flush('Invalid user ID', { status: 400, statusText: 'Bad Request' });
  });

  it('should create a user and return 201 status (createUser)', () => {
    const newUser = {
      userName: 'New User',
      email: 'new@example.com'
    };

    const createdUser = {
      id: 6,
      userName: 'New User',
      email: 'new@example.com'
    };
  
    userService.createUser(newUser).subscribe(response => {
      expect(response.status).toBe(201);
      expect(response.statusText).toBe('Created');
      expect(response.body).toEqual(createdUser);
    });
  
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(createdUser, { status: 201, statusText: 'Created' });
  });

  it('should handle 400 Bad Request (createUser)', () => {
    const invalidUser = {
      userName: '',
      email: 'invalid-email'
    };
  
    userService.createUser(invalidUser).subscribe({
      next: () => fail('should fail with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);                
        expect(error.statusText).toBe('Bad Request');  
        expect(error.error).toBe('User Name cannot be blank, Please enter a valid email'); 
      }
    });
  
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(invalidUser);
    req.flush('User Name cannot be blank, Please enter a valid email', { status: 400, statusText: 'Bad Request' });
  });

  it('should update a user and return 202 status (updateUser)', () => {
    const userId = 1;
    const updatedUser = {
      userName: 'Updated User',
      email: 'updated@example.com'
    };

    userService.updateUser(userId, updatedUser).subscribe(response => {
      expect(response.status).toBe(202);
      expect(response.statusText).toBe('Accepted');
      expect(response.body).toEqual(updatedUser);
    });

    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedUser);
    req.flush(updatedUser, { status: 202, statusText: 'Accepted' });
  });

  it('should handle 400 Bad Request (updateUser)', () => {
    const userId = -1;
    const invalidUser = {
      userName: '',
      email: 'invalid-email'
    };

    userService.updateUser(userId, invalidUser).subscribe({
      next: () => fail('should fail with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error).toBe('User Name cannot be blank, Please enter a valid email');
      }
    });

    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(invalidUser);
    req.flush('User Name cannot be blank, Please enter a valid email', { status: 400, statusText: 'Bad Request' });
  });

  // updateUser should return 404 Not Found when user does not exist
  it('should handle 404 Not Found (updateUser)', () => {
    const userId = 999;
    const updatedUser = {
      userName: 'Updated User',
      email: 'updated@example.com'
    };

    userService.updateUser(userId, updatedUser).subscribe({
      next: () => fail('should fail with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error).toBe('User not found with Id: ' + userId);
      }
    });

    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedUser);
    req.flush('User not found with Id: ' + userId, { status: 404, statusText: 'Not Found' });
  });

  // deleteUser should return 200 OK when user is successfully deleted
  it('should delete a user and return 200 status (deleteUser)', () => {
    const userId = 1;
    const deleteMessage = 'User deleted with Id: ' + userId;

    userService.deleteUser(userId).subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('Ok');
      expect(response.body).toBe(deleteMessage);
    });

    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('DELETE');
    req.flush(deleteMessage, { status: 200, statusText: 'Ok' });
  });

  // deleteUser should return 404 Not Found when user does not exist
  it('should handle 404 Not Found (deleteUser)', () => {
    const userId = 999;
    const errorMessage = 'User not found with Id: ' + userId;

    userService.deleteUser(userId).subscribe({
      next: () => fail('should fail with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error).toBe(errorMessage);
      }
    });

    const req = httpMock.expectOne(baseUrl + "/" + userId);
    expect(req.request.method).toBe('DELETE');
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });
});
