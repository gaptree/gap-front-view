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

    unshiftUser(user) {
        this.data.users.unshift(user);
    }
}

test('bind arr unshift', () => {
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

    userListView.unshiftUser({
        userId: 'id4',
        name: 'tom',
        age: 28,
        address: 'hz'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id4"> tom - 28 - hz </span><span id="id2"> rose - 21 - sh </span><span id="id3"> mike - 20 - zj </span></div>');

    userListView.unshiftUser({
        userId: 'id4',
        name: 'tom',
        age: 23,
        address: 'shanghai'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id4"> tom - 23 - shanghai </span><span id="id2"> rose - 21 - sh </span><span id="id3"> mike - 20 - zj </span></div>');
});
