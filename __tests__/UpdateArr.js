import {View} from '../index';

class UserListView extends View {
    template() {
        return this.html`
        <div
            arr="users"
            item-as="user"
            item-key=${user => user.name}
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
});
