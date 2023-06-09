const getUserSampleBody = () => {
  const emailRamdon = Math.floor(Math.random() * 1000);

  return {
    email: `test${emailRamdon}@cypresstest.com`,
    firstName: 'Cypress',
    lastName: 'Test',
    birthDate: new Date().toISOString(),
    phone: '(111) 222-3344',
    status: 'DQL',
    marketingSource: 'Facebook',
  };
};

const testUsers = {
  getUserFirst: null,
  getUserSecond: null,
  patchUser: null,
  deleteUser: null,
};

describe(`Users API Integration Tests`, () => {
  /**
   * Create User endpoint
   */

  it(`POST /users`, () => {
    for (const user in testUsers) {
      const bodyPayload = getUserSampleBody();

      cy.request({
        url: 'http://localhost:9000/users',
        method: 'POST',
        body: bodyPayload,
      }).then((res) => {
        testUsers[user] = res.body;

        expect(res.status).eq(201);
        expect(res.body.firstName).to.eq(bodyPayload.firstName);
        expect(res.body.lastName).to.eq(bodyPayload.lastName);
        expect(res.body.email).to.eq(bodyPayload.email);
        expect(res.body.birthDate).to.eq(bodyPayload.birthDate);
        expect(res.body.phone).to.eq(bodyPayload.phone);
        expect(res.body.status).to.eq(bodyPayload.status);
        expect(res.body.marketingSource).to.eq(bodyPayload.marketingSource);
      });
    }
  });

  /**
   * Get Users endpoint
   */
  it(`GET /users`, () => {
    cy.request({ url: 'http://localhost:9000/users', method: 'GET' }).then(
      (res) => {
        expect(res.status).eq(200);
        expect(res.body.data.length).to.be.greaterThan(0);
      },
    );
  });

  it(`GET /users?firstName=Name&limit=20&page=1&sort=-1&sortBy=createdAt`, () => {
    cy.request({
      url: `http://localhost:9000/users?firstName=${testUsers.getUserFirst.firstName}&limit=20&page=1&sort=-1&sortBy=createdAt`,
      method: 'GET',
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.page).to.eq('1');
      expect(res.body.limit).to.eq('20');
      expect(res.body.sort).to.eq('-1');
      expect(res.body.sortBy).to.eq('createdAt');
      expect(res.body.data.length).to.be.greaterThan(0);
      expect(
        res.body.data.every((user) =>
          user.firstName.match(testUsers.getUserFirst.firstName),
        ),
      );
    });
  });

  it(`GET /users?lastName=Name&limit=20&page=1&sort=1&sortBy=firstName`, () => {
    cy.request({
      url: `http://localhost:9000/users?lastName=${testUsers.getUserSecond.lastName}&limit=20&page=1&sort=1&sortBy=firstName`,
      method: 'GET',
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.page).to.eq('1');
      expect(res.body.limit).to.eq('20');
      expect(res.body.sort).to.eq('1');
      expect(res.body.sortBy).to.eq('firstName');
      expect(res.body.data.length).to.be.greaterThan(0);
      expect(
        res.body.data.every((user) =>
          user.lastName.match(testUsers.getUserSecond.lastName),
        ),
      );
    });
  });

  /**
   * Update User endpoint
   */

  it(`PATCH /users/id firstName, lastName, birthDate, phone, status and marketingSource`, () => {
    const bodyPayload = {
      firstName: 'Test',
      lastName: 'Tested',
      birthDate: new Date().toISOString(),
      phone: '(111) 222-3344',
      status: 'DQL',
      marketingSource: 'Facebook',
    };

    cy.request({
      url: `http://localhost:9000/users/${testUsers.patchUser._id}`,
      method: 'PATCH',
      body: bodyPayload,
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.firstName).to.eq(bodyPayload.firstName);
      expect(res.body.lastName).to.eq(bodyPayload.lastName);
      expect(res.body.birthDate).to.eq(bodyPayload.birthDate);
      expect(res.body.phone).to.eq(bodyPayload.phone);
      expect(res.body.status).to.eq(bodyPayload.status);
      expect(res.body.marketingSource).to.eq(bodyPayload.marketingSource);
    });
  });

  it(`PATCH /users/id only lastName`, () => {
    cy.request({
      url: `http://localhost:9000/users/${testUsers.patchUser._id}`,
      method: 'PATCH',
      body: { isDeleted: 'true', lastName: 'Testing', _id: '01' },
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.lastName).to.eq('Testing');
      expect(res.body.isDeleted).to.eq(false);
      expect(res.body._id).to.not.eq('01');
    });
  });

  /**
   * Soft Delete User endpoint
   */
  it(`DELETE /users/id`, () => {
    cy.request({
      url: `http://localhost:9000/users/${testUsers.deleteUser._id}`,
      method: 'DELETE',
    }).then((res) => {
      expect(res.status).eq(200);
      expect(res.body.isDeleted).to.eq(true);
    });

    cy.request({ url: 'http://localhost:9000/users', method: 'GET' }).then(
      (res) => {
        expect(res.status).eq(200);
        expect(res.body.data).to.not.include({
          _id: testUsers.deleteUser._id,
        });
      },
    );
  });
});
