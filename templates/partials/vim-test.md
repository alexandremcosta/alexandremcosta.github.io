Something I need to do very often (and quickly) when writing code is to test it.  
It's easy to do this in VIM without any plugins

```vim
let s:term_buf_nr = -1

function! s:RunTestLine() abort
    if s:term_buf_nr == -1
        execute 'terminal mix test % ' . '--exclude test --include line:'. line('.') " <- CHANGE THIS
        let s:term_buf_nr = bufnr("$")
    else
        try
            execute "bdelete! " . s:term_buf_nr
        endtry
        let s:term_buf_nr = -1
        call <SID>RunTestLine()
    endif
endfunction

nnoremap <silent> <Leader>t :call <SID>RunTestLine()<CR>
tnoremap <silent> <Leader>t <C-w>N:call <SID>RunTestLine()<CR>
```

If you are on `current_filename.ex` at line 30 and press `<Leader>t`, the snippet run:  
```shell
mix test path/to/current_filename.ex --exclude test --include line:30
```
In other words, it runs a single line of an elixir test file.  
With minimal changes you can port to your language, or extend it to run all tests in this file.  
<br>
And profit....YAY!
