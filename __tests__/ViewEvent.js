import {View} from '../index';
import {getView} from '../js/lib/holder';

class UserView extends View {
    template() {
        return this.html`
        <div class="user">$${'name'} - $${'address'}</div>
        `;
    }

    changeName() {
        this.data.name = 'changed';
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
                on-change-name=${userView => this.changeUserName(userView)}
            />
            </div>
        </div>
        `;
    }

    changeUserName(userView) {
        userView.changeName();
    }
}

test('view event', () => {
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
    const bookAuthorElem = document.querySelector('.book-author');
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">jack - yk</div>');

    const userView = getView('##0##');
    userView.trigger('change-name');

    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="user">changed - yk</div>');
});