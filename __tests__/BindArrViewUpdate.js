import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
            <span bind-id="userId">
                $${'name'}
                -
                $${'age'}
                -
                $${'address'}
            </span>
        `;
    }
}

class UserListView extends View {
    template() {
        return this.html`
        <div
            arr="users"
            item-as="user"
            item-key=${user => user.name}
        >
            ${() => this.html`
                <gap-view
                    view=${new UserView()}
                    bind="user"
                />
            `}
        </div>
        `;
    }
}

test('bind arr view update', () => {
    const userListView = new UserListView();
    userListView.appendTo(document.body);

    userListView.update({
        users: [
            {userId: 'id2', name: 'rose', age: 21, address: 'sh'},
            {userId: 'id3', name: 'mike', age: 20, address: 'zj'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id2"> rose - 21 - sh </span><span id="id3"> mike - 20 - zj </span></div>');

    /*
     * todo
    userListView.update({
        users: [
            {userId: 'id1', name: 'name 1', age: 21, address: 'sh'},
            {userId: 'id3', name: 'mike', age: 20, address: 'zj'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id1"> name 1 - 21 - sh </span><span id="id3"> mike - 20 - zj </span></div>');
        */
});
