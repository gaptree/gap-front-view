import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
        <form action="javascript:;">
            <input
                name="userId"
                bind-value="userId"
                bind-id="userId"
            >
            <input
                name="name"
                bind-value="name"
                bind-required="required"
            >
            <input
                name="address"
                bind-value="address"
            >
            <span class="name-span" bind-html="name"></span>
            -
            <span class="address-span" bind-html="address"></span>
        </form>
        `;
    }
}

test('bind elem prop', () => {
    const userView = new UserView();
    expect(userView.getBindedQueries()).toEqual(['userId', 'name', 'required', 'address']);

    userView.update({
        userId: 'id1',
        name: 'Mike',
        address: 'Shanghai'
    });
    //console.log(userView.getLastLogs());

    userView.appendTo(document.body);
    const userIdInput = document.querySelector('[name="userId"]');
    const nameInput = document.querySelector('[name="name"]');
    const addressInput = document.querySelector('[name="address"]');
    const nameSpan = document.querySelector('.name-span');
    const addressSpan = document.querySelector('.address-span');

    expect(nameInput.required).toBe(false);
    expect(userIdInput.value).toBe('id1');
    expect(nameInput.value).toBe('Mike');
    expect(addressInput.value).toBe('Shanghai');

    expect(nameSpan.innerHTML).toBe('Mike');
    expect(addressSpan.innerHTML).toBe('Shanghai');

    userView.update({
        userId: 'id2',
        name: 'Tom',
        required: 'required',
        address: 'Beijin'
    });

    expect(nameInput.required).toBe(true);
    expect(userIdInput.value).toBe('id2');
    expect(nameInput.value).toBe('Tom');
    expect(addressInput.value).toBe('Beijin');

    expect(nameSpan.innerHTML).toBe('Tom');
    expect(addressSpan.innerHTML).toBe('Beijin');
});
