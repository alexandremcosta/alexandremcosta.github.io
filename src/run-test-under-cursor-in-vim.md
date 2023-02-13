# Run Test Under Cursor in Vim

The first thing I do when I setup Vim is to make it run code instantly.  
When I write code, in any language, I need to see its output constantly.  
This is specially important when you are developing with tests.  

#### Here is a snippet to run the test case under cursor
It creates a terminal buffer and run the test command in it. If the buffer already exists, the
function will close that buffer and run the test command. It uses `%` to interpolate the current
filename in the command, and `. line('.')` to append the current line number.

The command `nnoremap` and `tnoremap` are used to map the function to the keybinding <Leader>t in
normal and terminal mode respectively, so when the user press <Leader>t it will execute the
function, providing a convenient way to run tests in terminal mode.

```lua
" Keep track of the buffer number for the terminal window "
let s:term_buf_nr = -1

" Define function "
function! s:RunTestLine() abort

    " If terminal buffer is not open yet "
    if s:term_buf_nr == -1

        " Open new terminal window and run test command with the current file and line number "
        execute 'terminal mix test % ' . '--exclude test --include line:'. line('.')

        " Save the buffer number of the new terminal window "
        let s:term_buf_nr = bufnr("$")

    " If terminal buffer is already open "
    else

        " Try to close the existing terminal buffer, do not fail if already closed "
        try
            execute "bdelete! " . s:term_buf_nr
        endtry

        " Reset the buffer number variable "
        let s:term_buf_nr = -1

        " Call the function again to open a new terminal window "
        call <SID>RunTestLine()
    endif
endfunction

" Map leader + t to call the RunTestLine function in normal and terminal mode "
nnoremap <silent> <Leader>t :call <SID>RunTestLine()<CR>
tnoremap <silent> <Leader>t <C-w>N:call <SID>RunTestLine()<CR>
```

In this example, if we are on `line 25` of `file.exs` and press `<Leader>t`, it opens a terminal
in a split to run `mix test file.ex --exclude test --include line:25`. You should change the
command to your needs.

{{ blog-nav.html }}

