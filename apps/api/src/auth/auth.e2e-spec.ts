import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Test data
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
  };

  const testUser2 = {
    email: 'test2@example.com',
    password: 'password456',
    displayName: 'Test User 2',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.userBadge.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /auth/register', () => {
    it('should register new user and return user + token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');

      expect(response.body.user).toMatchObject({
        email: testUser.email,
        displayName: testUser.displayName,
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');

      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);

      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(dbUser).toBeTruthy();
      expect(dbUser?.email).toBe(testUser.email);
      expect(dbUser?.displayName).toBe(testUser.displayName);

      // Verify password is hashed
      expect(dbUser?.password).not.toBe(testUser.password);
      expect(dbUser?.password.length).toBeGreaterThan(20); // bcrypt hash is long
    });

    it('should reject duplicate email', async () => {
      // First registration should succeed
      await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);

      // Second registration with same email should fail
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email');
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
        '',
      ];

      for (const invalidEmail of invalidEmails) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            ...testUser,
            email: invalidEmail,
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      }
    });

    it('should require minimum password length', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          password: '12345', // Less than 6 characters
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(JSON.stringify(response.body.message)).toContain('6');
    });

    it('should validate displayName length', async () => {
      // Test minimum length (less than 2 characters)
      const shortNameResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          displayName: 'A', // Only 1 character
        })
        .expect(400);

      expect(shortNameResponse.body).toHaveProperty('message');

      // Test maximum length (more than 50 characters)
      const longNameResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          displayName: 'A'.repeat(51), // 51 characters
        })
        .expect(400);

      expect(longNameResponse.body).toHaveProperty('message');
    });

    it('should reject missing required fields', async () => {
      // Missing email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          password: testUser.password,
          displayName: testUser.displayName,
        })
        .expect(400);

      // Missing password
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          displayName: testUser.displayName,
        })
        .expect(400);

      // Missing displayName
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
    });

    it('should login existing user and return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');

      expect(response.body.user).toMatchObject({
        email: testUser.email,
        displayName: testUser.displayName,
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');

      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Credenciales');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Credenciales');
    });

    it('should validate email format on login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notanemail',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should require minimum password length on login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: '12345', // Less than 6 characters
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should update lastActiveAt on successful login', async () => {
      const userBefore = await prisma.user.findUnique({
        where: { email: testUser.email },
        include: { progress: true },
      });

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const userAfter = await prisma.user.findUnique({
        where: { email: testUser.email },
        include: { progress: true },
      });

      expect(userAfter?.progress?.lastActiveAt).toBeTruthy();
      if (userBefore?.progress?.lastActiveAt && userAfter?.progress?.lastActiveAt) {
        expect(userAfter.progress.lastActiveAt.getTime()).toBeGreaterThan(
          userBefore.progress.lastActiveAt.getTime()
        );
      }
    });
  });

  describe('GET /auth/me', () => {
    let validToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and get token
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      validToken = registerResponse.body.accessToken;
      userId = registerResponse.body.user.id;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        email: testUser.email,
        displayName: testUser.displayName,
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me').expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with malformed authorization header', async () => {
      // Missing "Bearer" prefix
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', validToken)
        .expect(401);

      // Wrong prefix
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Basic ${validToken}`)
        .expect(401);
    });

    it('should return 401 with expired token', async () => {
      // This is a manually created expired token for testing
      // In a real scenario, you might need to configure JWT with very short expiry
      // or mock the JWT service to return an expired token

      // For now, we'll test with a clearly invalid/tampered token
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.invalid';

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 when user is deleted after token issued', async () => {
      // Delete the user from database
      await prisma.userProgress.delete({
        where: { userId },
      });
      await prisma.user.delete({
        where: { id: userId },
      });

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Complete Flow', () => {
    it('should register -> login -> get profile successfully', async () => {
      // Step 1: Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser2)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('accessToken');

      const registrationToken = registerResponse.body.accessToken;
      const userId = registerResponse.body.user.id;

      // Step 2: Get profile with registration token
      const profileResponse1 = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${registrationToken}`)
        .expect(200);

      expect(profileResponse1.body).toMatchObject({
        id: userId,
        email: testUser2.email,
        displayName: testUser2.displayName,
      });

      // Step 3: Login with credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser2.email,
          password: testUser2.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body).toHaveProperty('accessToken');

      const loginToken = loginResponse.body.accessToken;

      // Step 4: Get profile with login token
      const profileResponse2 = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(profileResponse2.body).toMatchObject({
        id: userId,
        email: testUser2.email,
        displayName: testUser2.displayName,
      });

      // Verify both tokens work (they should be different)
      expect(registrationToken).not.toBe(loginToken);
    });

    it('should handle multiple users independently', async () => {
      // Register first user
      const user1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const user1Token = user1Response.body.accessToken;
      const user1Id = user1Response.body.user.id;

      // Register second user
      const user2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser2)
        .expect(201);

      const user2Token = user2Response.body.accessToken;
      const user2Id = user2Response.body.user.id;

      // Verify users have different IDs
      expect(user1Id).not.toBe(user2Id);

      // Verify user1 token returns user1 data
      const user1Profile = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(user1Profile.body.id).toBe(user1Id);
      expect(user1Profile.body.email).toBe(testUser.email);

      // Verify user2 token returns user2 data
      const user2Profile = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user2Profile.body.id).toBe(user2Id);
      expect(user2Profile.body.email).toBe(testUser2.email);
    });

    it('should create user progress on registration', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const userId = registerResponse.body.user.id;

      // Verify user progress was created
      const userProgress = await prisma.userProgress.findUnique({
        where: { userId },
      });

      expect(userProgress).toBeTruthy();
      expect(userProgress?.totalXp).toBe(0);
      expect(userProgress?.level).toBe(1);
      expect(userProgress?.levelTitle).toBe('Prompt Curious');
      expect(userProgress?.currentStreak).toBe(0);
      expect(userProgress?.longestStreak).toBe(0);
      expect(userProgress?.lessonsCompleted).toBe(0);
    });
  });
});
