import {View} from '../index';

class UserListView extends View {
    template() {
        return this.html`
        <div
            arr="users"
            item-as="user"
            item-key=${user => user.userId}
            item-filter=${user => user.age > 18}
        >
            ${() => this.html`
                <span bind-id="user.userId">
                    $${'user.name'}
                    -
                    $${'user.age'}
                    -
                    $${'user.address'}
                </span>
            `}
        </div>
        `;
    }

    removeUser(user) {
        this.data.users.delete(user);
    }
}

test('bind arr delete', () => {
    const userListView = new UserListView();
    userListView.appendTo(document.body);

    userListView.update({
        users: [
            {userId: 'id1', name: 'jack', age: 10, address: 'sh'},
            {userId: 'id2', name: 'rose', age: 21, address: 'sh'},
            {userId: 'id3', name: 'mike', age: 20, address: 'zj'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id2"> rose - 21 - sh </span><span id="id3"> mike - 20 - zj </span></div>');

    userListView.removeUser({
        userId: 'id3', name: 'mike', age: 20, address: 'zj'
    });

    expect(userListView.data.users[2]).toBe(undefined);

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id2"> rose - 21 - sh </span></div>');

    userListView.removeUser({
        userId: 'id2', name: 'rose', age: 21, address: 'sh'
    });

    expect(userListView.data.users[1]).toBe(undefined);

    expect(document.body.innerHTML.trim())
        .toBe('<div></div>');
});
