#/#/#                                     #/#/#
#/#/#       THE ECHO PROGRAM STARTS       #/#/#
#/#/# =================================== #/#/#
#/#/#       THE ECHO PROGRAM STARTS       #/#/#
#/#/#                                     #/#/#

for "H  e   l   l   o   {comma} {space} U  s   e   r   !  {\n} {\n} Y  o   u   r   {space} N  a  m   e   :  {space}
     72 101 108 108 111 44      32      85 115 101 114 33 10   10   89 111 117 114 32      78 97 109 101 58 32

++++++++++ init c0
[
    >+++++++        70; c1; for "H" in "Hello"
    >++++++++++     100; c2; for "e" in "Hello"，"e" in User，"a" "e" in "Name"
    >+++++++++++    110; c3; for "l" "l" "o" in "Hello"，"s" "r" in "User"，"o" "u" "r" in "Your" and "m" in "Name"
    >++++++++       80; c4; for "U" in "User"，"Y" in "Your" and "N" in "Name"
    >++++++         60; c5; for ":" in "Name: "
    >++++           40; c6; for {comma} in "Hello{comma}"
    >+++            30; c7; for {space}s and "!"
    >+              10; c8; for {\n\n}
    <<<<<<<<-       decrement loop counter
]

>++.                H c1 72
>+.                 e c2 101
>--..              ll c3 108
+++.                o c3 111
>>>++++.      {comma} c6 44
>++.          {space} c7 32
<<<+++++.           U c4 85
<++++.              s c3 115
<.                  e c2 101
>-.                 r c3 114
>>>>+.              ! c7 33
>..              \n\n c8 10
<<<<++++.           Y c4 89
<---.               o c3 111
++++++.             u c3 117
---.                r c3 114
>>>>-.        {space} c7 32
<<<-----------.     N c4 78
<<----.             a c2 97
>-----.             m c3 114
<++++.              e c2 101
>>>--.              : c5 58
>>.           {space} c7 32
> move to c8
[-]< clear c8
[-]< clear c7
[-]< clear c6
[-]< clear c5
[-]< clear c4
[-]< clear c3
[-]< clear c2
[-]< clear c1
[-]< clear c0

>>>>>>>>>>> move to c11



#/#/#                                     #/#/#
#/#/#             INPUT LOOP              #/#/#
#/#/# =================================== #/#/#
#/#/#             INPUT LOOP              #/#/#
#/#/#                                     #/#/#



C6: K (CAP)
C7: CH (CHECK HELPER); ALWAYS ZERO!
C8: COC1 (COPY OF CHAR)
C9: COC2 (COPY OF CHAR; WILL BE MOVED TO CIC LATER)
C10: T (TERMINATOR)
C11: Z (GUARD FOR LOOP; IF ZERO THE LOOP EXITS; WE CLEAR Z WHEN WE DETECT \N)
C12 AND SO ON: INPUT CELLS

now at c11; let's init Z
+

[ WE CHECK ON Z! Z MUST BE NONZERO UNTIL WE CONFIRM THAT \n APPEARS!

    <<<<<++++++++++>>>>> restore K

    now at c11
    [>] NUC
    , USER INPUT

    ========== check logic ==========
    plan:
    we store two copies at c8 and c9
    the original input cell will be temporarily zero
    and we move c8 back to the input cell
    in which we successfully made a REAL copy
    (with truth both at original cell and copy cell)
    
    #=#=# MOVER #=#=#

    [>+<-] move to neighbor
    > move to neighbor
    [
        <+ increment cic
        [<] move to t
        <<+ increment coc1
        >>>[>] move to right of neighbor
        < move back to neighbor
        - decrement neighbor so loop exits properly
    ]
    #=#=# MOVER FINISHED #=#=#
    
    we are now on NEIGHBOR (NUC) which is zero
    <[<]<< move to coc1

    QUICK REFRESH:
                                | we are now at COC1
                                v
    CELLNUM: | C6  |  C7  |   C8   |  C9  | C10 | C11 |
    VALUE:   | 10  |  00  |  ????  |  00  |  0  | 0/1 |
    NAME:    |  K  |  CH  |  COC1  | COC2 |  T  |  Z  |

    OUR PLAN IS TO:
    CHECK ON K
    WE DECREMENT K
    WE SAFE MINUS COC1

    <<[ check on K
        >> move into coc1
        [
            - DECREMENT COC1 (C8)
            < MOVE INTO CH WHICH IS 0 WHICH EXITS THE LOOP
        ] now on CH
        < move back to K
        - decrement K
    ] THIS LOOP WILL RUN TEN TIMES AT MOST

    >> NOW AT COC1 (C8)

    set COC2 to 1; if COC1 is not zero then clear COC2
    if COC1 is zero then COC2 remains 1
    then we check if COC2 is zero; if COC2 is not zero we enter the block
    and clear Z to exit the outer input loop
    >+< set COC2 to 1
    [ this block only enters when COC1 is not zero
        [-] clear COC1
        >[-]< clear COC2
    ]
    > now we check on COC2
    [ this block only enters when COC1 IS zero (so COC2 is still 1)
        >>- WE CLEAR Z HERE! (now Z = 0 which will exit the outer loop)
        <<[-] we go back to COC2 and clear it
        >> Z (now zero)
        >[>] NUC
        < CIC
        [-] clear CIC (so that the output loop doesn't output an unwanted 10)
        <[<] Z
        << COC2 (already zero)
    ]
    >>
    we are now at Z; the outer loop will check if we cleared Z or not
]

we are now at Z; let's clear c0 to c11 to make space for output
[-]< clear c11
[-]< clear c10
[-]< clear c9
[-]< clear c8
[-]< clear c7
[-]< clear c6
[-]< clear c5
[-]< clear c4
[-]< clear c3
[-]< clear c2
[-]< clear c1
[-]  clear c0


#/#/#                                     #/#/#
#/#/#             OUTPUT LOOP             #/#/#
#/#/# =================================== #/#/#
#/#/#             OUTPUT LOOP             #/#/#
#/#/#                                     #/#/#



because user can press \n at the very first input we safety check the first cic
back at the input loop if we detect \n then we clear cic
so if user presses \n at the start then c12 will be 0
>>>>>>>>>>>> c12
[ this block only executes when c12 is not zero!

    <<<<<<<<<<<< c0

    we are now at c0
    We output the user's name like this:

    Hello{comma}{space}{UserInputtedName}!

    First we output "Hello{comma}{space}"
    For "H  e   l   l   o   {comma} {space}" the asciis are
        72 101 108 108 111 44      32

    ++++++++++ init c0
    [
        >+++++++    70; c1; for "H"
        >++++++++++ 100; c2; for "e" "ll" "o"
        >++++       40; c3; for comma
        >+++        30; c4; for space
        <<<<-
    ]

    now at c0
    >++.         H   (c1 = 72)
    >+.          e   (c2 = 101)
    +++++++..    l   (c2 = 108)
    +++.         o   (c2 = 111)
    >++++.       comma (c3 = 44)
    >++.         space (c4 = 32)

    now we add 1 to c4 so it becomes 33 (!)
    +        c4 = 33

    <[-] clear c3
    <[-] clear c2
    <[-] clear c1
    <[-] clear c0

    >>>>>>>>>>>> We are now at the first inputted cell
    [.>] we output until we reach the right of the last inputted cell
    <[<] we move back to Z
    <<<<<<< c4 (which holds 33)
    . we output the last "!"

    [-] we clear this cell so that the output loop exits!
]