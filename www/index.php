<?php
$path = '/vagrant/';
require_once($path.'mod.php');
echo '<h1>Vagrant project</h1>';
echo __FILE__;
foo1('Hello vagrant!!!');
phpinfo();