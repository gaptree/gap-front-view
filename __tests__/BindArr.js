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
}

test('bind arr', () => {
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

    userListView.update({
        users: [
            {userId: 'id3', name: 'mike', age: 20, address: 'zj'},
            {userId: 'id4', name: 'tom', age: 20, address: 'beijin'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id3"> mike - 20 - zj </span><span id="id4"> tom - 20 - beijin </span></div>');

    userListView.update({
        users: [
            {userId: 'id3', name: 'mike-changed', age: 21, address: 'zj-changed'},
            {userId: 'id4', name: 'tom-changed', age: 21, address: 'beijin'}
        ]
    });

    expect(document.body.innerHTML.trim())
        .toBe('<div><span id="id3"> mike-changed - 21 - zj-changed </span><span id="id4"> tom-changed - 21 - beijin </span></div>');
});
