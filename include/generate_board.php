<?php

    $content = "<table>\n";

    for ($i=0; $i < 8; $i++) { 

        $content .= "\t<tr>\n";

        for ($j=0; $j < 8; $j++) { 
            if(($i+$j)%2 == 0){
                $color = 'white';
            }else{
                $color = 'black';
            }
            $id = 'id="sq'.($i*8)+$j.'"';
            $content .= "\t\t<td $id class=\"square $color\"></td>\n";
        }

        $content .= "\t</tr>\n";
    }

    $content .= "</table>\n";

    echo $content;
?>