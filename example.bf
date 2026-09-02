#/#/#                                     #/#/#
#/#/#       THE ECHO PROGRAM STARTS       #/#/#
#/#/# =================================== #/#/#
#/#/# LIMITED TO SINGLE DIGIT LENGTH ONLY #/#/#
#/#/#                                     #/#/#

for
Hello(comma) User!
the unicodes are
H  e   l   l   o   (comma) (space) U  s   e   r   !
72 101 108 108 111 44      32      85 115 101 114 33
++++++++++ Initialize c0 to 10
[
    >+++++++ c1 to 70 for H and U
    >++++++++++ c2 to 100 for e l l o s e r
    >+++ c3 to 30 for space comma !
    <<<- decrement c0 loop counter
]

>++.             c1 72
>+.              c2 101
+++++++..        c2 108 (double l)
+++.             c2 111
>++++++++++++++. c3 comma 44
------------.    c3 space 32
<<+++++++++++++. c1 85
>++++.           c2 115
--------------.  c2 101
+++++++++++++.   c2 114
>+.              c3 33 !

[-]< clear c3 now c2
[-]< clear c2 now c1
[-]< clear c1 now c0
++++++++++.. Newline (c0 now 10)
[-] clear up 10

now at c0; we will output "Name:\n"
For "N  a  m   e   :   \n" the asciis are:
     78 97 109 101 58  10
++++++++++ init loop counter
[
    >++++++++ 80; c1; for "N"
    >++++++++++ 100; c2; for "a m e"
    >++++++ 60; c3; for ":"
    >+ 10; c4; for "\n"
    <<<<- c0; decrement counter
] now at c0
>--.            N;    c1
>---.           a;    c2
++++++++++++.   m;    c2
--------.       e;    c2
>--.            ":";  c3
>..             \n\n; c4
now at c4
[-]< clear c4; now at c3
[-]< clear c3; now at c2
[-]< clear c2; now at c1
[-]< clear c1; now at c0
[-] clear c0 in case of any remaining bits

++++++++++.. newline
[-] clear c0

>>>>>>>>>>> we are now at c11 again which is zero
which we can safely output "Your Name:\n\n" going right

for "Y  o   u   r   space N  a  m   e   :  \n" the asciis are
     89 111 117 114 32    78 97 109 101 58 10
++++++++++ init loop counter at c11
[
    >+++++++++ 90; c12; for "Y" and "N"
    >++++++++++ 100; c13; for "o" "u" "r" "a" "m" "e"
    >+++ 30; c14; for space
    >++++++ 60; c15; for ":"
    >+ 10; c16; for \n
    <<<<<-
] now at c11 which is zero
>-.                  Y; c12; 89
>+++++++++++.        o; c13; 111
++++++.              u; c13; 117
---.                 r; c13; 114
>++.                 space; c14; 32
<<-----------.       N; c12; 78
>-----------------.  a; c13; 97
++++++++++++.        m; c13; 109
--------.            e; c13; 101
>>--.                ":"; c15; 58
>..                  \n\n; c16; 10
[-]< clear c16
[-]< clear c15
[-]< clear c14
[-]< clear c13
[-]< clear c12; now at c11
[-] clear c11 in case of any remaining bits

now we can be sure that no cells have any value :)
let's do the planning

C6: K (CAP)
C7: CH (CHECK HELPER); ALWAYS ZERO!
C8: COC1 (COPY OF CHAR)
C9: COC2 (COPY OF CHAR)
C10: T (TERMINATOR)
C11: Z (GUARD FOR LOOP; IF ZERO THE LOOP EXITS; WE CLEAR Z WHEN WE DETECT \N)
C12 AND SO ON: ZEROES UNTIL INPUTTED; POTENTIAL TERMINATORS!

now at c11; let's init Z
+
<<<<< now at K (c6); let's init here
++++++++++ this will be important!
>>>>> now at z

Z IS NOW ONE WHICH IS THE EQUIVALENT OF "TRUE"
WHEN WE DETECT NEWLINE WE WILL MAKE Z ZERO WHICH IS EQUIVALENT TO "FALSE"

[ WE CHECK ON Z! Z MUST BE NONZERO UNTIL WE CONFIRM THAT \n APPEARS!

    now at c11
    [>] we move to next uninputted cell
    , USER INPUT

    ========== check logic ==========
    plan:
    we store two copies at c8 and c9
    the original input cell will be temporarily zero
    and we move c8 back to the input cell
    in which we successfully made a REAL copy
    (with truth both at original cell and copy cell)
    
    #=#=# MOVER #=#=#
    STEP ONE: MOVE THE CURRENT CELL TO C8 AND C9
    [ PLAN: CHECK ON CIC
        - decrement CIC (CURRENT INPUT CELL)
        [<] MOVE TO T
        <+ c9 COC2
        <+ c8 COC1
        [>] NUC (NEXT UNINPUTTED CELL) (we won't stop at Z because z is still 1)
        < CIC
        CHECK ON CIC
    ]
    STEP TWO: MOVE COC2 TO CIC
    [ PLAN: CHECK ON COC2
        - decrement coc2
        [>] move to nuc
        < move to cic
        + increment cic
        [<] move to t
        < move to coc2 (c9)
    ] NOW AT COC2

    < NOW AT COC1 WHICH IS A GOOD COPY

    SUMMARY: WE NOW HAVE CIC BACK TO ORIGINAL VALUE AND COC1 AS A COPY
    WE WILL BE WORKING ON COC1 AS A COPY SINCE CIC NEEDS TO BE UNTOUCHED
    IN ORDER TO LET THE OUTPUT LOOP FUNCTION PROPERLY

    #=#=# MOVER FINISHED #=#=#

    WE ARE NOW AT COC1 WHICH WE WILL BE WORKING ON!

    QUICK REFRESH:
                                | we are now at COC1
                                v
    CELLNUM: | C6  |  C7  |   C8   | C9  | C10 | C11 |
    VALUE:   | 10  |  00  |  ????  |  0  |  0  | 0/1 |
    NAME:    |  K  |  CH  |  COC1  | COC2|  T  |  Z  |

    OUR PLAN IS TO:
    CHECK ON K
    WE DECREMENT K
    WE SAFE MINUS COC1

    [ check on K
        >> move into coc1
        [
            - DECREMENT COC1 (C8)
            < MOVE INTO CH WHICH IS 0 WHICH EXITS THE LOOP
        ]
        << move back to K
        - decrement K
    ] THIS LOOP WILL RUN TEN TIMES AT MOST

    >> NOW AT COC1 (C8)

    [ CLOSE Z IF COC1 IS NOT ZERO WHICH MEANS COC1 IS LESS THAN ZERO
        >>> WE ARE AT Z (C11)
        - WE MAKE Z ZERO!
        < MOVE LEFT TO T WHICH ENDS THE LOOP
    ]
    NOW AT T (C10)
    i think we can move on z and it will check

    > NOW WE ARE AT Z
]