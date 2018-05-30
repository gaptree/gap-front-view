# gap-front-view

## Install

```sh
yarn add gap-front-view
```

## Usage

### Example 1

```javascript
import {View} from 'gap-front-view';

class UserView extends View {
    template() {
        return this.html`
        <form action="javascript:;" on-submit=${(form, e) => this.onSubmit(form, e)}>
            <input
                name="userId"
                bind-value="userId"
                bind-id="userId"
                on-change=${(input) => this.showUserId(input.value)}>
            <input
                name="name"
                bind-value="name"
                cb-change=${(input) => this.showName(input.value)}>
            <button>
                submit
            </button>
        </form>
        <div id="res">
            $${'userId'}
            -
            $${'name'}
        </div>
        `;
    }

    onSubmit(form, e) {
        console.log(form);
        console.log(e);
    }

    showUserId(userId) {
        console.log(userId);
    }

    showName(name) {
        console.log(name);
    }
}
```

```javascript
const userView = new UserView([
    userId: 'id1',
    name: 'Mike'
]);

userView.appendTo(document.body);
```

Expected Html

```html
 <form action="javascript:;">
    <input name="userId" value="id1" id="id1">
    <input name="name" value="Mike">
    <button>submit</button>
</form>
<div id="res"> id1 - Mike </div>
```

```javascript
userView.update([
    userId: 'id2',
    name: 'Tom'
])
```

Expected Html

```html
 <form action="javascript:;">
    <input name="userId" value="id2" id="id2">
    <input name="name" value="Tom">
    <button>submit</button>
</form>
<div id="res"> id2 - Tom </div>
```

### Example 2

```javascript
import {View} from 'gap-front-view';

class UserListView extends View {
    template() {
        return this.html`
        <div id="user-list" bind-arr="users" arr-key=${user => user.userId}>
            ${() => this.html`
                <span bind-id="userId">
                    $${'name'}
                </span>
            `}
        </div>
        `;
    }
}
```

```javascript
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
```

Expected Html

```html
<div id="user-list">
    <span id="userId1">Mike</span>
    <span id="userid2">Tom</span>
</div>
```

```javascript
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
```

Expected Html

```html
<div id="user-list">
    <span id="userId1">Mike changed</span>
    <span id="userid3">Rose</span>
</div>
```

```javascript
userListView.arrPush('users', {
    userId: 'userId4',
    name: 'Jack'
});
```

Expected Html

```html
<div id="user-list">
    <span id="userId1">Mike changed</span>
    <span id="userid3">Rose</span>
    <span id="userid4">Jack</span>
</div>
```

```javascript
userListView.arrPop('users');
```

Expected Html

```html
<div id="user-list">
    <span id="userId1">Mike changed</span>
    <span id="userid3">Rose</span>
</div>
```

```javascript
userListView.arrPush('users', {
    userId: 'userId6',
    name: 'cat'
});

userListView.arrPush('users', {
    userId: 'userId7',
    name: 'dog'
});

userListView.arrFilter('users', user => user.name.indexOf('dog') >= 0);
```

```html
<div id="user-list">
    <span id="userId7">dog</span>
</div>
```

```javascript
import {View} from 'gap-front-view';

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
        <div id="user-list" bind-arr="users" arr-key=${user => user.userId}>
            ${(user) => new UserView(user)}
        </div>
        `;
    }
}
```
