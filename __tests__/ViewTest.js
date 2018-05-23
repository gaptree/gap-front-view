import {View} from '../index.js';

class UserView extends View {
    template() {
        return this.html`
        <form action="javascript:;">
            <input
                name="userId"
                bind-value="userId"
                bind-id="userId"
                on-change=${(input) => this.setUserId(input.value)}>
            <input
                name="name"
                bind-value="name"
                on-change=${(input) => this.setName(input.value)}>
            <button on-submit=${() => this.onSubmit()}>submit</button>
        </form>
        <div id="res">$${'userId'} - $${'name'}</div>
        `;
    }
}

test('view', () => {
    const userView = new UserView({
        userId: 'userId',
        name: 'Mike',
    });

    userView.appendTo(document.body);

    const userIdInput = document.querySelector('[name="userId"]');
    const nameInput = document.querySelector('[name="name"]');

    expect(userIdInput.value).toBe('userId');
    expect(nameInput.value).toBe('Mike');

    userView.update({
        userId: 'changedUserId',
        name: 'Tom'
    });

    expect(userIdInput.value).toBe('changedUserId');
    expect(nameInput.value).toBe('Tom');
});
