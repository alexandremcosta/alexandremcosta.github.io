# Toggle VIM Split Fullscreen

We don't need any fancy plugins to toggle a Vim split fullscreen.  
Just place this on your `.vimrc` and resize your Vim split with `<Leader>f`

```vim
function! s:ZoomToggle() abort
    if exists('t:zoomed') && t:zoomed
        execute t:zoom_winrestcmd
        let t:zoomed = 0
    else
        let t:zoom_winrestcmd = winrestcmd()
        resize
        vertical resize
        let t:zoomed = 1
    endif
endfunction
command! ZoomToggle call s:ZoomToggle()
nnoremap <silent> <Leader>f :ZoomToggle<CR>
```
