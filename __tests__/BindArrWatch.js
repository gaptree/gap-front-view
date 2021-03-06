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
            ${(key) => this.html`
                <span watch='user.name' on-click=${() => {}}>
                ${() => this.watchAge(this.data.users.get(key))}
                </span>
            `}
        </div>
        `;
    }

    watchAge(user) {
        return `${user.userId} - ${user.name} - ${user.age} - ${user.address}`;
    }

    updateUser(user) {
        this.data.users.push(user);
    }
}

test('bind arr watch', () => {
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
        .toBe('<div><span>id2 - rose - 21 - sh</span><span>id3 - mike - 20 - zj</span></div>');

    userListView.update({
        users: [
            {userId: 'id3', name: 'mike changed', age: 20, address: 'sh'},
            {userId: 'id4', name: 'tom', age: 20, address: 'beijin'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span>id3 - mike changed - 20 - sh</span><span>id4 - tom - 20 - beijin</span></div>');

    userListView.updateUser({
        userId: 'id4',
        name: 'tom changed',
        age: 22,
        address: 'beijin changed'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span>id3 - mike changed - 20 - sh</span><span>id4 - tom changed - 22 - beijin changed</span></div>');
});
