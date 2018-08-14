# gap-front-view

## Install

```sh
yarn add gap-front-view
```

## Quik Start

### Bind HtmlElement's propertes and attributes

```javascript
import {View} from 'gap-front-view';

class UserView extends Veiw {
    template() {
        return this.html`
            <form action="javascript:;">
                <input
                    name="userId"
                    bind-value="userId"
                    bind-id="userId"
                >
                <input
                    name="name"
                    bind-value="name"
                >
            </form>
        `;
    }
}

const userView = new UserView();

userView.update({
    userId: 'userId',
    name: 'Mike'
})
```

### Bind text

```javascript
import {View} from 'gap-front-view';

class UserView extends View {
    template() {
        return this.html`
        <div>
            $${'user.name'} - $${'user.address'}
        </div>
        `;
    }
}

const userView = new UserView();
userView.update({
    user: {
        name: 'tom',
        address: 'china'
    }
})
```

### Include sub template

```javascript
import {View} from 'gap-front-view';

class BookView extends View {
    template() {
        return this.html`
        <div>
            <span class="book-title">$${'book.title'}</span>
            <div class="book-author">
            ${this.getAuthorTpl()}
            </div>
        </div>
        `;
    }

    getAuthorTpl() {
        return this.html`
        <span>$${'book.author.name'} - $${'book.author.address'}</span>
        `;
    }
}

const bookView = new BookView();
bookView.update({
    book: {
        title: 'Real Analysis, Fourth Edition',
        author: {
            name: 'mike',
            address: 'usa'
        }
    }
});
```

### Include sub view

Bind one property of current data

```javascript
class UserView extends View {
    template() {
        return this.html`
        <div class="user-view">$${'name'} - $${'address'}</div>
        `;
    }
}

class BookView extends View {
    template() {
        return this.html`
        <div>
            <span class="book-title">$${'book.title'}</span>
            <div class="book-author">
            <gap-view
                view=${new UserView()}
                bind="book.author"
            ></gap-view>
            <div class="author">
                $${'book.author.name'} - $${'book.author.address'}
            </div>
            </div>
        </div>
        `;
    }
}

const bookView = new BookView();
bookView.appendTo(document.body);

bookView.update({
    book: {
        title: 'time history',
        author: {
            name: 'jack',
            address: 'yk'
        }
    }
});
```

Bind multi properties of current data

```javascript
class CoverView extends View {
    template() {
        return this.html`
        <div class="cover">
            $${'title'} - $${'author.name'} - $${'author.address'}
        </div>
        `;
    }
}

class BookView extends View {
    template() {
        return this.html`
        <div>
            <span class="book-title">$${'book.title'}</span>
            <div class="book-author">
            <gap-view
                ref=${view => this.coverView = view}
                view=${new CoverView()}
                bind-multi=${{
                    title: 'book.title',
                    'author.name': 'book.author.name',
                    'author.address': 'book.author.address'
                }}
            ></gap-view>
            </div>
        </div>
        `;
    }
}
```

### Handle array

```javascript
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

const userListView = new UserListView();
userListView.update({
    users: [
        {userId: 'id1', name: 'jack', age: 10, address: 'sh'},
        {userId: 'id2', name: 'rose', age: 21, address: 'sh'},
        {userId: 'id3', name: 'mike', age: 20, address: 'zj'}
    ]
});

userListView.data.users.push({userId: 'id4', name: '', ...});
userListView.data.users.pop();

// todo
// userListView.data.users.unshift({userId: 'id4', name: '', ...});

userListView.data.users.shift();
userListView.data.users.delete({userId: 'id3', name: '' ...});
userListView.data.users.filter(user => user.age > 18);
```

### Use props to transfor data

```javascript
class UserView extends View {
    construct(props) {
        super(props);
        // ...
        // coding here
    }

    template() {
        return this.html`
        <div class="${this.props.class}">
        $${'user.name'} - $${'user.address'}
        </div>
        `;
    }
}

const userView = new UserView({class: 'primary'});
userView.update({
    user: {
        name: 'rose',
        address: 'usa'
    }
})
```

## todo

[] Implement feature like 'computed'

- <https://mobx.js.org/refguide/computed-decorator.html#-computed>
- <https://vuejs.org/v2/guide/computed.html>

[x] Separate GapCommitTxn from norm Txn.

[] Replace 'gap-view' with 'custom-tag-name'

[] Prevent infinite loop of changing data caused by `watcher`

[x] GapArr.unshift(item)

[x] Alternate `console.log` for debug