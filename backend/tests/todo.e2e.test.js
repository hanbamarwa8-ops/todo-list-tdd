import { test, expect } from '@playwright/test';

test.describe('Todo App - Scénario end-to-end (navigateur)', () => {

  test('cycle de vie complet d\'une tâche : créer -> lire -> modifier -> supprimer', async ({ page }) => {

    const timestamp = Date.now();

    const email = `test${timestamp}@example.com`;
    const password = 'TestPassword123!';
    const name = `Utilisateur Test ${timestamp}`;

    const taskTitle = `Faire les courses ${timestamp}`;

    

    await page.goto('http://localhost:3000');

    // CRÉER UN COMPTE

    await page.getByText('Se connecter').click();

    await expect(page.locator('.auth-modal')).toBeVisible();

    await page.getByText('Créer un compte', { exact: true }).click();

    await page.fill('#auth-name', name);
    await page.fill('#auth-email', email);
    
    await page.fill('#auth-password', password);
    
    await page.fill('#auth-confirm', password);

    await page.locator('.auth-submit').click();

    await expect(page.locator('.auth-modal')).toBeHidden();

    await page.goto('http://localhost:3000/todo');

    await expect(page.locator('.app-title')).toBeVisible();

    //CRÉATION

    await page.fill('.new-task-input', taskTitle);

    await page.click('.btn-add');

    const taskItem = page.locator(
      '.task-item',
      { hasText: taskTitle }
    );

    await expect(taskItem).toBeVisible();

    await expect(
      taskItem.locator('.task-text')
    ).toHaveText(taskTitle);

    // LECTURE

    const checkbox = taskItem.locator(
      'input[type="checkbox"]'
    );

    await expect(checkbox).not.toBeChecked();

    //MODIFICATION
    await checkbox.click();

    await expect(checkbox).toBeChecked();

    await expect(taskItem).toHaveClass(/completed/);

    await page.reload();

    const reloadedTask = page.locator(
      '.task-item',
      { hasText: taskTitle }
    );

    await expect(reloadedTask).toBeVisible();

    await expect(
      reloadedTask.locator('input[type="checkbox"]')
    ).toBeChecked();

    // SUPPRESSION

    await reloadedTask
      .locator('.btn-delete')
      .click();

    await expect(
      page.locator('.task-item', {
        hasText: taskTitle
      })
    ).toHaveCount(0);

    // Vérifier que la suppression est persistée
    await page.reload();

    await expect(
      page.locator('.task-item', {
        hasText: taskTitle
      })
    ).toHaveCount(0);

  });

});