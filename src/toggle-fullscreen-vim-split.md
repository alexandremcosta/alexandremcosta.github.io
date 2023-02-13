# Toggle VIM Split Fullscreen

We don't need any fancy plugins to toggle a Vim split fullscreen.  
Just place this on your `.vimrc` and resize your Vim split with `Leader + f`.

```lua
" Define a function called ZoomToggle "
function! s:ZoomToggle() abort

    " Check if current state is zoomed "
    if exists('t:zoomed') && t:zoomed

        " Execute the command stored in t:zoom_winrestcmd to restore window "
        execute t:zoom_winrestcmd

        " Set t:zoomed to 0 "
        let t:zoomed = 0

    " If not zoomed "
    else

        " Store the current window layout in t:zoom_winrestcmd "
        let t:zoom_winrestcmd = winrestcmd()

        " Resize the current window "
        resize
        vertical resize

        " Set zoomed flag to 1 "
        let t:zoomed = 1
    endif
endfunction

" Define a command that calls the ZoomToggle function "
command! ZoomToggle call s:ZoomToggle()

" Map the command to the keybinding <Leader>f in normal mode "
nnoremap <silent> <Leader>f :ZoomToggle<CR>
```

{{ blog-nav.html }}
