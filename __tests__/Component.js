import {View} from '../index';

class AuthorView extends View {
    template() {
        return this.html`
            <div class="author"><span>${this.props.name}</span>$${'age'}</div>
        `;
    }
}

class BookView extends View {
    template() {
        return this.html`
            <div class="book-author">
                <AuthorView props=${{'name': 'gap'}} bind-age="age"></AuthorView>
            </div>
        `;
    }

    component() {return {AuthorView}; }
}

test('component', () => {
    const bookView = new BookView();
    bookView.appendTo(document.body);

    bookView.update({age: 18});

    const bookAuthorElem = document.querySelector('.book-author');
    expect(bookAuthorElem.innerHTML.trim()).toBe('<div class="author"><span>gap</span>18</div>');
});
