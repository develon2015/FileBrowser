SHELL = /bin/bash

.PHONY: all
all: 
	@echo '帮助文档:'
	@echo '	1. make install	安装fs命令'
	@echo '	2. make clean	卸载fs命令'

.PHONY: install
install: /usr/local/bin/fs
	@echo 命令fs已安装到您的系统上，路径为$^

/usr/local/bin/fs:
	@echo '请提供root权限，以安装fs脚本:'
	sudo touch $@ && sudo chmod +x $@
	sudo su -c "sudo printf '#!/bin/bash\nsudo PATH=\$$PATH PORT=\$$PORT /usr/bin/env node ''$(shell pwd)/index.js\n\n' >> $@"
	
.PHONY: clean
clean:
	sudo rm -rf /usr/local/bin/fs

