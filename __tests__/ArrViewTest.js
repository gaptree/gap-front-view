import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
            <span bind-id="userId">
                $${'name'}
            </span>
        `;
    }
}

class UserListView extends View {
    template() {
        return this.html`
        <div id="user-list"
            bind-arr="users"
            arr-key=${(user) => user.userId}>
            ${(user) => new UserView(user)}
        </div>
        `;
    }
}

test('arr view', () => {
    const userListView = new UserListView({
        users: [
            {
                userId: 'userId1',
                name: 'Mike'
            },
            {
                userId: 'userid2',
                name: 'Tom'
            }
        ]
    });

    userListView.appendTo(document.body);

    const userListElem = document.getElementById('user-list');
    const user1Elem = userListElem.children[0];

    expect(userListElem.children.length).toBe(2);
    expect(user1Elem.id).toBe('userId1');
    expect(user1Elem.innerHTML.trim()).toBe('Mike');

    userListView.update({
        users: [
            {
                userId: 'userId1',
                name: 'Mike changed'
            },
            {
                userId: 'userId3',
                name: 'Rose'
            }
        ]
    });


    const user3Elem = userListElem.children[1];

    expect(userListElem.children.length).toBe(2);
    expect(user1Elem.id).toBe('userId1');
    expect(user1Elem.innerHTML.trim()).toBe('Mike changed');

    expect(user3Elem.id).toBe('userId3');
    expect(user3Elem.innerHTML.trim()).toBe('Rose');

    userListView.arrPush('users', {
        userId: 'userId4',
        name: 'Jack'
    });

    expect(userListElem.children.length).toBe(3);

    const user4Elem = userListElem.children[2];
    expect(user4Elem.id).toBe('userId4');
    expect(user4Elem.innerHTML.trim()).toBe('Jack');


    userListView.arrPop('users');
    expect(userListElem.children.length).toBe(2);

    userListView.arrPush('users', {
        userId: 'userId6',
        name: 'cat'
    });

    userListView.arrPush('users', {
        userId: 'userId7',
        name: 'dog'
    });

    userListView.arrFilter('users', user => user.name.indexOf('dog') >= 0);
    expect(userListElem.children[0].innerHTML.trim()).toBe('dog');
});
