import {View} from '../index';

class UserListView extends View {
    template() {
        return this.html`
        <div
            arr="users"
            item-as="user"
            item-key=${user => user.userId}
        >
            ${(key) => this.html`
                <span trigger='user.age'>
                ${() => this.triggerAge(this.data.users.get(key))}
                </span>
            `}
        </div>
        `;
    }

    updateUser(user) {
        this.data.users.update(user);
    }

    triggerAge(user) {
        return `${user.userId} - ${user.name} - ${user.age} - ${user.address}`;
    }
}

test('bind arr', () => {
    const userListView = new UserListView();
    userListView.appendTo(document.body);

    userListView.update({
        users: [
            {userId: 'id2', name: 'rose', age: 21, address: 'sh'},
            {userId: 'id3', name: 'mike', age: 20, address: 'zj'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span>id2 - rose - 21 - sh</span><span>id3 - mike - 20 - zj</span></div>');

    userListView.update({
        users: [
            {userId: 'id3', name: 'mike', age: 20, address: 'zj'},
            {userId: 'id4', name: 'tom', age: 20, address: 'beijin'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span>id3 - mike - 20 - zj</span><span>id4 - tom - 20 - beijin</span></div>');

    userListView.updateUser({
        userId: 'id4', name: 'tom changed', age: 28, address: 'beijin changed'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span>id3 - mike - 20 - zj</span><span>id4 - tom changed - 28 - beijin changed</span></div>');
});
