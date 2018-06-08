import {View} from '../index';

class UserListView extends View {
    template() {
        return this.html`
        <div
            arr="users"
            item-as="user"
            item-key=${user => user.name}
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

    addUser(user) {
        this.data.users.push(user);
    }
}

test('bind arr push', () => {
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

    userListView.addUser({
        userId: 'id4',
        name: 'tom',
        age: 28,
        address: 'hz'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id2"> rose - 21 - sh </span><span id="id3"> mike - 20 - zj </span><span id="id4"> tom - 28 - hz </span></div>');

    userListView.addUser({
        userId: 'id4',
        name: 'tom',
        age: 23,
        address: 'shanghai'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id2"> rose - 21 - sh </span><span id="id3"> mike - 20 - zj </span><span id="id4"> tom - 23 - shanghai </span></div>');
});
