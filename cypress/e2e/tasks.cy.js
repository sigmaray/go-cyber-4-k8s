describe('Task Manager CRUD', () => {
  const uniqueTitle = () => `Task ${Date.now()}`;

  beforeEach(() => {
    cy.request('GET', '/api/tasks').then((response) => {
      const tasks = response.body;
      if (Array.isArray(tasks)) {
        tasks.forEach((task) => {
          cy.request('DELETE', `/api/tasks/${task.id}`);
        });
      }
    });
    cy.visit('/');
  });

  it('shows empty state when no tasks exist', () => {
    cy.get('[data-cy=empty-state]').should('be.visible');
    cy.get('[data-cy=task-count]').should('contain', '0');
  });

  it('creates a new task', () => {
    const title = uniqueTitle();
    const description = 'Learn Gin and Gorm';

    cy.get('[data-cy=task-title-input]').type(title);
    cy.get('[data-cy=task-description-input]').type(description);
    cy.get('[data-cy=create-task-btn]').click();

    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.get('[data-cy=task-list]').should('be.visible');
    cy.get('[data-cy=task-item]').should('have.length', 1);
    cy.get('[data-cy=edit-title]').should('have.value', title);
    cy.get('[data-cy=edit-description]').should('have.value', description);
    cy.get('[data-cy=task-count]').should('contain', '1');
  });

  it('updates an existing task', () => {
    const title = uniqueTitle();
    cy.get('[data-cy=task-title-input]').type(title);
    cy.get('[data-cy=create-task-btn]').click();

    const updatedTitle = `${title} updated`;
    cy.get('[data-cy=edit-title]').clear().type(updatedTitle);
    cy.get('[data-cy=edit-description]').clear().type('Updated description');
    cy.get('[data-cy=edit-done]').check();
    cy.get('[data-cy=save-task-btn]').click();

    cy.get('[data-cy=edit-title]').should('have.value', updatedTitle);
    cy.get('[data-cy=edit-description]').should('have.value', 'Updated description');
    cy.get('[data-cy=edit-done]').should('be.checked');
  });

  it('deletes a task', () => {
    const title = uniqueTitle();
    cy.get('[data-cy=task-title-input]').type(title);
    cy.get('[data-cy=create-task-btn]').click();

    cy.get('[data-cy=task-item]').should('have.length', 1);
    cy.get('[data-cy=delete-task-btn]').click();

    cy.get('[data-cy=empty-state]').should('be.visible');
    cy.get('[data-cy=task-count]').should('contain', '0');
  });

  it('health endpoint returns ok', () => {
    cy.request('/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
    });
  });
});
