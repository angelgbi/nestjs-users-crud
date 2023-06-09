describe(`Users API E2E Test`, () => {
  const bodyElements = {
    firstName: 'Test',
    lastName: 'Tested',
    email: 'test@test.com',
    birthDate: new Date().toISOString(),
    phone: '(111) 222-3344',
    status: 'DQL',
    marketingSource: 'Facebook',
  };

  it(`GET /users)`, () => {
    cy.visit(
      `http://localhost:9000/swagger#/Users%20API/UsersController_getUsers`,
    );

    cy.get(
      '#operations-Users_API-UsersController_getUsers .try-out__btn',
    ).click();

    /**
     * Clear inputs
     */

    for (const bodyElement in bodyElements) {
      cy.get(
        `#operations-Users_API-UsersController_getUsers [data-param-name="${bodyElement}"] input`,
      ).clear();
    }

    cy.get('.execute').click();

    cy.get(
      '#operations-Users_API-UsersController_getUsers .live-responses-table code span.hljs-attr',
    )
      .filter((index, element) => Cypress.$(element).text().includes('_id'))
      .should('have.length.gte', 1);
  });

  it(`GET /users?lastName="")`, () => {
    const testPayload = {
      lastName: 'Testing',
    };

    cy.visit(
      `http://localhost:9000/swagger#/Users%20API/UsersController_getUsers`,
    );

    cy.get(
      '#operations-Users_API-UsersController_getUsers .try-out__btn',
    ).click();

    /**
     * Clear inputs
     */
    for (const bodyElement in bodyElements) {
      cy.get(
        `#operations-Users_API-UsersController_getUsers [data-param-name="${bodyElement}"] input`,
      ).clear();
    }

    /**
     * Fill inputs
     */
    for (const bodyElement in testPayload) {
      cy.get(
        `#operations-Users_API-UsersController_getUsers [data-param-name="${bodyElement}"] input`,
      ).type(testPayload[bodyElement]);
    }

    cy.get('.execute').click();

    cy.get(
      '#operations-Users_API-UsersController_getUsers .live-responses-table code span',
    )
      .filter((index, element) =>
        Cypress.$(element).text().includes(testPayload.lastName),
      )
      .should('have.length.gte', 1);
  });
});
